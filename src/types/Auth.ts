export type UserRole = "admin" | "user";



export type Auth = {
   displayName: string;
   uid: string;
   photoUrl: string;
   role: UserRole
}