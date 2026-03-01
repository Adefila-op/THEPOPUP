// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IArtistRegistry {
    struct Artist {
        address artistAddress;
        string name;
        string bio;
        string subscriptionPrice;
        uint256 createdAt;
    }
    function getAllArtists() external view returns (Artist[] memory);
    function artistCount() external view returns (uint256);
    function artists(uint256 id) external view returns (address, string memory, string memory, string memory, uint256);
}

interface IPopupSubscription {
    function isUserSubscribed(address subscriber, address artist) external view returns (bool);
}

contract DropRegistry {
    struct Drop {
        uint256 dropId;
        address artist;
        string title;
        string imageHash;         // IPFS CID for the drop image
        uint256 priceSubscriber;  // price in wei for subscribers
        uint256 pricePublic;      // price in wei for non-subscribers
        uint256 supply;
        uint256 claimed;
        uint256 createdAt;
        uint256 endTime;
        bool active;
    }

    IArtistRegistry public artistRegistry;
    IPopupSubscription public popupSubscription;
    address public owner;
    
    mapping(uint256 => Drop) public drops;
    uint256 public dropCount = 0;
    
    // Track claims: dropId => claimer => claimed
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    event DropCreated(uint256 indexed dropId, address indexed artist, string title, uint256 supply);
    event DropClaimed(uint256 indexed dropId, address indexed claimer, uint256 price);
    event DropDeactivated(uint256 indexed dropId);
    event SubscriptionRecorded(address indexed subscriber, address indexed artist);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyRegisteredArtist() {
        require(_isRegisteredArtist(msg.sender), "Not a registered artist");
        _;
    }

    constructor(address _artistRegistryAddress) {
        owner = msg.sender;
        artistRegistry = IArtistRegistry(_artistRegistryAddress);
    }
    
    function setPopupSubscription(address _popupSubscriptionAddress) external onlyOwner {
        popupSubscription = IPopupSubscription(_popupSubscriptionAddress);
    }

    /// @notice Check if an address is a registered artist in the ArtistRegistry
    function _isRegisteredArtist(address _addr) internal view returns (bool) {
        uint256 count = artistRegistry.artistCount();
        for (uint256 i = 0; i < count; i++) {
            (address artistAddr,,,,) = artistRegistry.artists(i);
            if (artistAddr == _addr) return true;
        }
        return false;
    }

    /// @notice Create a new drop (only registered artists or owner)
    function createDrop(
        string memory _title,
        address _artistAddress,
        string memory _imageHash,
        uint256 _priceSubscriber,
        uint256 _pricePublic,
        uint256 _supply,
        uint256 _durationHours
    ) public returns (uint256) {
        require(
            msg.sender == owner || _isRegisteredArtist(msg.sender),
            "Not authorized to create drops"
        );
        require(bytes(_title).length > 0, "Title required");
        require(_supply > 0, "Supply must be > 0");
        require(_pricePublic >= _priceSubscriber, "Public price must be >= subscriber price");
        require(_durationHours > 0, "Duration must be greater than 0");

        uint256 dropId = dropCount;
        dropCount++;

        // If an artist calls this, they can only create for themselves. 
        // If owner calls this, they can create for any artist.
        address assignedArtist = msg.sender == owner ? _artistAddress : msg.sender;

        drops[dropId] = Drop({
            dropId: dropId,
            artist: assignedArtist,
            title: _title,
            imageHash: _imageHash,
            priceSubscriber: _priceSubscriber,
            pricePublic: _pricePublic,
            supply: _supply,
            claimed: 0,
            createdAt: block.timestamp,
            endTime: block.timestamp + (_durationHours * 1 hours),
            active: true
        });

        emit DropCreated(dropId, assignedArtist, _title, _supply);
        return dropId;
    }

    /// @notice Record a subscription (called by platform/owner) 
    /// Deprecated in favor of direct reads from PopupSubscription
    function recordSubscription(address, address) public pure {
        revert("Deprecated");
    }

    /// @notice Check if user is subscribed to an artist
    function isSubscribed(address _subscriber, address _artist) public view returns (bool) {
        if (address(popupSubscription) == address(0)) return false;
        return popupSubscription.isUserSubscribed(_subscriber, _artist);
    }

    /// @notice Claim a drop (payable)
    function claimDrop(uint256 _dropId) public payable {
        require(_dropId < dropCount, "Drop does not exist");
        Drop storage drop = drops[_dropId];
        require(drop.active, "Drop is not active");
        require(block.timestamp <= drop.endTime, "Drop has ended");
        require(drop.claimed < drop.supply, "Drop is sold out");
        require(!hasClaimed[_dropId][msg.sender], "Already claimed");

        // Determine price based on subscription status
        uint256 price = isSubscribed(msg.sender, drop.artist)
            ? drop.priceSubscriber 
            : drop.pricePublic;
        
        require(msg.value >= price, "Insufficient payment");

        drop.claimed++;
        hasClaimed[_dropId][msg.sender] = true;

        // Send payment to the platform withdrawal system (75/25 split)
        if (address(popupSubscription) != address(0)) {
            (bool forwarded, ) = address(popupSubscription).call{value: msg.value}(
                abi.encodeWithSignature("addEarnings(address)", drop.artist)
            );
            require(forwarded, "Failed to route earnings");
        } else {
            // Fallback: send 100% directly to artist
            (bool sent, ) = payable(drop.artist).call{value: msg.value}("");
            require(sent, "Fallback payment failed");
        }

        emit DropClaimed(_dropId, msg.sender, msg.value);
    }

    /// @notice Deactivate a drop (only artist who created it or owner)
    function deactivateDrop(uint256 _dropId) public {
        require(_dropId < dropCount, "Drop does not exist");
        require(
            drops[_dropId].artist == msg.sender || msg.sender == owner,
            "Not authorized"
        );
        drops[_dropId].active = false;
        emit DropDeactivated(_dropId);
    }

    /// @notice Get a single drop
    function getDrop(uint256 _dropId) public view returns (Drop memory) {
        require(_dropId < dropCount, "Drop does not exist");
        return drops[_dropId];
    }

    /// @notice Get all drops
    function getAllDrops() public view returns (Drop[] memory) {
        Drop[] memory result = new Drop[](dropCount);
        for (uint256 i = 0; i < dropCount; i++) {
            result[i] = drops[i];
        }
        return result;
    }

    /// @notice Get drops by a specific artist
    function getDropsByArtist(address _artist) public view returns (Drop[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < dropCount; i++) {
            if (drops[i].artist == _artist) count++;
        }
        
        Drop[] memory result = new Drop[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < dropCount; i++) {
            if (drops[i].artist == _artist) {
                result[idx] = drops[i];
                idx++;
            }
        }
        return result;
    }

    /// @notice Get total active drops count
    function getActiveDropCount() public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < dropCount; i++) {
            if (drops[i].active) count++;
        }
        return count;
    }
}
