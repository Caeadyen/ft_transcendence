import { User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
	constructor(partial: Partial<UserEntity>) {
		Object.assign(this, partial);
	}
	
	@ApiProperty()
	id: number;

	@ApiProperty()
	id42: number;

	@ApiProperty()
	name: string;

	@ApiProperty()
	user42Name: string;

	@ApiProperty()
	email: string;

	@ApiProperty()
	activated2FA: boolean;

	@Exclude()
	password: string;

	@Exclude()
	twoFactorAuthenticationSecret: string;
}
