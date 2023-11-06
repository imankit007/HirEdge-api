

create database authentication;
use authentication;

create table auth (
	refresh_token varchar(256),
    user_id varchar(32),
    role varchar(32)
);

alter table auth add primary key (refresh_token);

desc  auth;

