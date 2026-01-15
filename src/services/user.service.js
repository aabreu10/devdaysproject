const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
];

export const getAllUsers = () => {
    return users;
}

export const getUserById = (id) => {
    return users.find(user => user.id === id);
}

export const deleteUserById = (id) => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        const deletedUser = users.splice(index, 1);
        return deletedUser[0];
    }
    return null;
}

export const createUser = (user) => {
    const newUser = {
        id: Math.random().toString(36).slice(2),
        name: user.name
    };
    users.push(newUser);
    return newUser;
}

export const updateUserById = (id, user) => {
    const existingUser = users.find(u => u.id === id);
    if (existingUser) {
        existingUser.name = user.name || existingUser.name;
        return existingUser;
    }
    return null;
}

