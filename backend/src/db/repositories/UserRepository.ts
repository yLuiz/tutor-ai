
import { User, UserModel } from '../entities/UserEntity';

export class UserRepository {
    async findAll(): Promise<(User & { id: string })[]> {
        const users = await UserModel.find({}, { password: 0 }).lean();

        if (!users || users.length === 0) return [] as (User & { id: string })[];

        return users.map(user => ({
            ...user,
            id: user._id.toString(),
        }));
    }

    async findByEmail(email: string): Promise<(User & { id: string }) | null> {
        const user = await UserModel.findOne({ email }).lean();
        if (!user) return null;

        return {
            ...user,
            id: user._id.toString(),
        };
    }

    async findById(id: string): Promise<(User & { id: string }) | null> {
        const user = await UserModel.findById(id, { password: 0 }).lean();
        if (!user) return null;

        return {
            ...user,
            id: user._id.toString(),
        };
    }

    async create(userData: Partial<User>): Promise<User & { id: string }> {
        const createdUser = new UserModel(userData);

        const savedUser = await createdUser.save();
        return {
            ...savedUser,
            id: savedUser._id.toString(),
        };
    }

    async update(id: string, updateData: Partial<User>): Promise<User | null> {
        return await UserModel.findByIdAndUpdate(id, updateData, {
            new: true,
        }).lean();
    }

    async updateProfile(id: string, profile: { name?: string; email?: string; bio?: string }): Promise<User | null> {
        return await UserModel.findByIdAndUpdate(
            id,
            { $set: profile },
            { new: true }
        ).lean();
    }

    async changePassword(id: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
        const user = await UserModel.findById(id);
        if (!user) return { success: false, message: 'Usuário não encontrado' };

        if (user.password !== oldPassword) {
            return { success: false, message: 'Senha antiga incorreta' };
        }

        user.password = newPassword;
        await user.save();
        return { success: true };
    }

    async delete(id: string): Promise<boolean> {
        const result = await UserModel.findByIdAndDelete(id);
        return !!result;
    }

    async existsByEmail(email: string): Promise<boolean> {
        return await UserModel.exists({ email }).then(Boolean);
    }
}