// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AvatarRegistry {
    // Map artist address to IPFS image hash
    mapping(address => string) public avatars;
    
    address public owner;

    event AvatarUpdated(address indexed artist, string imageHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Update avatar for an artist (can be called by the admin owner or the artist themselves)
    function setAvatar(address _artist, string memory _imageHash) public {
        require(msg.sender == owner || msg.sender == _artist, "Not authorized");
        avatars[_artist] = _imageHash;
        emit AvatarUpdated(_artist, _imageHash);
    }

    /// @notice Get avatar for an artist
    function getAvatar(address _artist) public view returns (string memory) {
        return avatars[_artist];
    }
}
