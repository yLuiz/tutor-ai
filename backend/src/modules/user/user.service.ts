import bcrypt from "bcryptjs";
import { UserRoles } from "../../db/entities/UserEntity";
import { UserRepository } from "../../db/repositories/UserRepository";

export class UserService {
  private userRepository = new UserRepository();

  async createUser(data: any) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('Usuário já existe');
    }
    
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await this.userRepository.create({
      ...data,
      password: hashedPassword,
      role: data.role || UserRoles.COMMON,
      bio: data.bio || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
  }

  async getUsers(email?: string) {
    if (email) return this.userRepository.findByEmail(email);
    return this.userRepository.findAll();
  }

  async searchUsers(filters: { email?: string; name?: string }) {
    const { email, name } = filters;

    const query: any = {};
    if (email) query.email = { $regex: email, $options: 'i' };
    if (name) query.name = { $regex: name, $options: 'i' };

    return this.userRepository.search(query);
  }

  async getUserById(id: string) {
    return this.userRepository.findById(id);
  }

  async updateUser(id: string, updates: any) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error("Usuário não encontrado");

    const payload = {
      ...user,
      ...updates,
      id: user.id, // for update consistency
      password: updates.password ? await bcrypt.hash(updates.password, 10) : user.password,
    };

    return this.userRepository.update(id, payload);
  }

  async updateProfile(id: string, updates: any) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error("Usuário não encontrado");

    return this.userRepository.updateProfile(id, {
      name: updates.name ?? user.name,
      email: updates.email ?? user.email,
      bio: updates.bio ?? user.bio,
    });
  }

  async changePassword(id: string, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error("Usuário não encontrado");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("Senha antiga incorreta");

    const newHashed = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(id, { password: newHashed });
    return { message: 'Senha atualizada com sucesso' };
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error("Usuário não encontrado");
    await this.userRepository.delete(id);
  }
}
