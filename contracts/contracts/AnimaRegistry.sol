// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AnimaRegistry {
    struct Companion {
        address owner;
        string name;
        string memoryRootHash;
        uint256 memoryNodeCount;
        uint256 createdAt;
        uint256 updatedAt;
    }

    uint256 private _nextId = 1;
    mapping(uint256 => Companion) public companions;
    mapping(address => uint256[]) public ownerCompanions;

    event CompanionCreated(uint256 indexed id, address indexed owner, string name);
    event MemoryUpdated(uint256 indexed id, string newRootHash, uint256 nodeCount);

    modifier onlyOwner(uint256 id) {
        require(companions[id].owner == msg.sender, "Not owner");
        _;
    }

    function createCompanion(
        string calldata name,
        string calldata memoryRootHash
    ) external returns (uint256) {
        uint256 id = _nextId++;
        companions[id] = Companion({
            owner: msg.sender,
            name: name,
            memoryRootHash: memoryRootHash,
            memoryNodeCount: 0,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        ownerCompanions[msg.sender].push(id);
        emit CompanionCreated(id, msg.sender, name);
        return id;
    }

    function updateMemory(
        uint256 id,
        string calldata newRootHash,
        uint256 nodeCount
    ) external onlyOwner(id) {
        companions[id].memoryRootHash = newRootHash;
        companions[id].memoryNodeCount = nodeCount;
        companions[id].updatedAt = block.timestamp;
        emit MemoryUpdated(id, newRootHash, nodeCount);
    }

    function verifyMemory(
        uint256 id,
        string calldata currentRootHash
    ) external view returns (bool) {
        return keccak256(bytes(companions[id].memoryRootHash))
            == keccak256(bytes(currentRootHash));
    }

    function getOwnerCompanions(
        address owner
    ) external view returns (uint256[] memory) {
        return ownerCompanions[owner];
    }
}
