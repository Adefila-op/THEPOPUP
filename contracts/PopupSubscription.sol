// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title POP UP Subscription Contract
 * @notice Manages artist whitelist and simple $1 subscription payments.
 *         25% of the incoming funds are forwarded to a platform wallet,
 *         the remaining 75% to the artist.  This is a minimal sketch;
 *         a real deployment would use an oracle for USD pricing and
 *         might mint NFTs or update on‑chain membership state.
 */
contract PopupSubscription is Ownable {
    address payable public platformWallet;
    mapping(address => bool) private _whitelisted;
    mapping(address => uint256) public pendingWithdrawals;
    mapping(address => address[]) public artistSubscribers;
    mapping(address => mapping(address => bool)) public isSubscribed;
    mapping(address => bool) public isAdmin;

    event Subscribed(address indexed subscriber, address indexed artist, uint256 amount);
    event ArtistWhitelisted(address indexed artist);
    event ArtistRemoved(address indexed artist);
    event PlatformWalletUpdated(address indexed newWallet);
    event Withdrawal(address indexed recipient, uint256 amount);

    constructor(address payable _platformWallet) Ownable(msg.sender) {
        require(_platformWallet != address(0), "zero platform wallet");
        platformWallet = _platformWallet;
        isAdmin[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(isAdmin[msg.sender] || owner() == msg.sender, "Caller is not an admin");
        _;
    }

    /* ========== ADMIN FUNCTIONS ========== */

    function addAdmin(address admin) external onlyOwner {
        require(admin != address(0), "zero address");
        isAdmin[admin] = true;
    }

    function removeAdmin(address admin) external onlyOwner {
        require(admin != owner(), "Cannot remove owner from admins");
        isAdmin[admin] = false;
    }

    function setPlatformWallet(address payable _wallet) external onlyAdmin {
        require(_wallet != address(0), "zero address");
        platformWallet = _wallet;
        emit PlatformWalletUpdated(_wallet);
    }

    function whitelistArtist(address artist) external onlyAdmin {
        require(artist != address(0), "zero address");
        _whitelisted[artist] = true;
        emit ArtistWhitelisted(artist);
    }

    function removeArtist(address artist) external onlyAdmin {
        _whitelisted[artist] = false;
        emit ArtistRemoved(artist);
    }

    function isWhitelisted(address artist) external view returns (bool) {
        return _whitelisted[artist];
    }

    /* ========== USER FUNCTIONS ========== */

    /// @notice Subscribe to a whitelisted artist by sending exactly 1 ETH
    /// @param artist Address of the artist to subscribe to
    function subscribe(address artist) external payable {
        require(_whitelisted[artist], "artist not whitelisted");
        require(msg.value > 0, "must send ETH");

        uint256 platformShare = (msg.value * 25) / 100;
        uint256 artistShare = msg.value - platformShare;

        pendingWithdrawals[platformWallet] += platformShare;
        pendingWithdrawals[artist] += artistShare;
        
        if (!isSubscribed[msg.sender][artist]) {
            isSubscribed[msg.sender][artist] = true;
            artistSubscribers[artist].push(msg.sender);
        }

        emit Subscribed(msg.sender, artist, msg.value);
    }

    /// @notice Route external earnings (like Drop purchases) into the pendingWithdrawals system
    function addEarnings(address artist) external payable {
        require(msg.value > 0, "must send ETH");
        
        uint256 platformShare = (msg.value * 25) / 100;
        uint256 artistShare = msg.value - platformShare;

        pendingWithdrawals[platformWallet] += platformShare;
        pendingWithdrawals[artist] += artistShare;
    }

    function getSubscribersCount(address artist) external view returns (uint256) {
        return artistSubscribers[artist].length;
    }
    
    function isUserSubscribed(address subscriber, address artist) external view returns (bool) {
        return isSubscribed[subscriber][artist];
    }

    /// @notice Allows the caller to withdraw pending funds. If the caller is an admin, they can withdraw the platformWallet balance.
    function withdraw() external {
        uint256 amount;
        address target;

        if (isAdmin[msg.sender]) {
            amount = pendingWithdrawals[platformWallet];
            target = platformWallet;
        } else {
            amount = pendingWithdrawals[msg.sender];
            target = msg.sender;
        }

        require(amount > 0, "no funds to withdraw");
        pendingWithdrawals[target] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "withdrawal failed");

        emit Withdrawal(msg.sender, amount);
    }
}
