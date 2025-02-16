// User & Member Interfaces
export interface IUser {
	id: string;
	username: string;
	handle: string;
	avatar: string | null;
	roles: number;
	password: string;
	disabled: boolean;
	deleted: boolean;
	bot: boolean;
	system: boolean;
	token: string;
	guilds: string[];
}

export interface IMember {
	id: string;
	user: Omit<IUser, 'password' | 'token'>;
	guildId: string;
	nickname: string;
	owner: boolean;
}

// Message Interface
export interface IMessage {
	id: string;
	content: string;
	embeds: IEmbed[];
	system: boolean;
	author: Omit<IUser, 'password' | 'token' | 'guilds'>;
	channelId: string;
	guildId?: string | null;
	ephemeral: boolean;
	readBy: string[];
	createdAt: Date;
}

export interface IEmbed {
	title: string;
	url: string;
	description: string;
	thumbnail: string;
}

// Guild & Channel Interface
export interface IGuild {
	id: string;
	name: string;
	icon: string | null;
	memberCount: number;
	members: string[];
	ownerId: string;
	channels: IChannel[];
	deleted: boolean;
}

//! Important
export enum ChannelTypes {
	DM = 0,
	TEXT = 1,
	VOICE = 2,
}

export interface IChannel {
	id: string;
	name: string;
	stickyMessage?: IMessage;
	messages: IMessage[];
	guildId: string;
	members: string[];
	type: ChannelTypes;
}

export enum WebSocketOP {
	HELLO = 0,
	MESSAGE_CREATE = 1,
	MESSAGE_UPDATE = 2,
	MESSAGE_DELETE = 3,
}