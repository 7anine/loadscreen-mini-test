function twoSum(nums, target) {
    const map = new Map(); // value -> index
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            // map.get(complement) gets me lower index because it was added first
            return [map.get(complement), i];
        }
        // Only set the value if it's not already there to keep the earliest index
        if (!map.has(nums[i])) {
            map.set(nums[i], i);
        }
    }
    return null;
}

const testCases = [
    { id: 1, nums: [2, 7, 11, 15], target: 9 },
    { id: 2, nums: [3, 2, 4], target: 6 },
    { id: 3, nums: [3, 3], target: 6 },
    { id: 4, nums: [1, 2, 3, 4, 5], target: 9 },
    { id: 5, nums: [0, 4, 3, 0], target: 0 },
    { id: 6, nums: [-1, -2, -3, -4, -5], target: -8 },
    { id: 7, nums: [1, 5, 2, 11], target: 7 },
    { id: 8, nums: [10, 20, 30, 40], target: 70 },
    { id: 9, nums: [100, 200, 300], target: 400 },
    { id: 10, nums: [1, 1, 1, 1, 2], target: 3 }
];

const answers = testCases.map(tc => twoSum(tc.nums, tc.target));
console.log(JSON.stringify(answers));