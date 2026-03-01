// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ArtistRegistry {
    struct Artist {
        address artistAddress;
        string name;
        string bio;
        string subscriptionPrice;
        uint256 createdAt;
    }

    // Artist ID => Artist Details
    mapping(uint256 => Artist) public artists;
    uint256 public artistCount = 0;

    // Address => Artist IDs (for quick lookup)
    mapping(address => uint256[]) public artistsByAddress;

    // Events
    event ArtistRegistered(
        uint256 indexed artistId,
        address indexed artistAddress,
        string name,
        uint256 timestamp
    );

    event ArtistUpdated(uint256 indexed artistId, string name, string bio);
    event ArtistRemoved(uint256 indexed artistId);

    // Owner for admin functions
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Register a new artist
    function registerArtist(
        address _artistAddress,
        string memory _name,
        string memory _bio,
        string memory _subscriptionPrice
    ) public onlyOwner returns (uint256) {
        require(_artistAddress != address(0), "Invalid artist address");
        require(bytes(_name).length > 0, "Name required");

        uint256 artistId = artistCount;
        artistCount++;

        artists[artistId] = Artist({
            artistAddress: _artistAddress,
            name: _name,
            bio: _bio,
            subscriptionPrice: _subscriptionPrice,
            createdAt: block.timestamp
        });

        artistsByAddress[_artistAddress].push(artistId);

        emit ArtistRegistered(artistId, _artistAddress, _name, block.timestamp);

        return artistId;
    }

    /// @notice Update artist details
    function updateArtist(
        uint256 _artistId,
        string memory _name,
        string memory _bio
    ) public onlyOwner {
        require(_artistId < artistCount, "Artist does not exist");
        require(bytes(_name).length > 0, "Name required");

        artists[_artistId].name = _name;
        artists[_artistId].bio = _bio;

        emit ArtistUpdated(_artistId, _name, _bio);
    }

    /// @notice Remove an artist
    function removeArtist(uint256 _artistId) public onlyOwner {
        require(_artistId < artistCount, "Artist does not exist");

        address artistAddr = artists[_artistId].artistAddress;
        delete artists[_artistId];

        emit ArtistRemoved(_artistId);
    }

    /// @notice Get artist by ID
    function getArtist(uint256 _artistId)
        public
        view
        returns (Artist memory)
    {
        require(_artistId < artistCount, "Artist does not exist");
        return artists[_artistId];
    }

    /// @notice Get all artists
    function getAllArtists() public view returns (Artist[] memory) {
        Artist[] memory result = new Artist[](artistCount);
        for (uint256 i = 0; i < artistCount; i++) {
            result[i] = artists[i];
        }
        return result;
    }

    /// @notice Get artist IDs by address
    function getArtistsByAddress(address _artistAddress)
        public
        view
        returns (uint256[] memory)
    {
        return artistsByAddress[_artistAddress];
    }
}
