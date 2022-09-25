import {describe, expect, test} from '@jest/globals';
import { icon, id, url } from '../../../libs/notion/properties';
import { Entity } from '../../../libs/notion/types';

describe('Notion properties', () => {
    describe('id', () => {
        const property = id();

        test('changed(...) should be false, always', () => {
            expect(property.changed({id:'123'}, {id:'123'})).toBeFalsy();
            expect(property.changed({id:'123'}, {id:'456'})).toBeFalsy();
        });

        test('fromPage(...) should work', async () => {
            const row = {id:''}
            await property.fromPage({id:'123'}, row);
            expect(row.id).toBe('123');
        });

        test('toPage(...) should work', () => {
            const page: any = {id:'final'};
            property.toPage({id:'123'}, page)
            expect(page.id).toBe('final');
        });
    });

    describe('icon', () => {
        type Icony = {avatar: string} & Entity;
        const property = icon<Icony, 'avatar'>('avatar');

        test('changed(...) should work', () => {
            expect(property.changed({avatar:'123', id:''}, {avatar:'123', id:''})).toBeFalsy();
            expect(property.changed({avatar:'123', id:''}, {avatar:'456', id:''})).toBeTruthy();
        });

        test('fromPage(...) should work', async () => {
            const row = {id:'', avatar:''}
            await property.fromPage({icon: {type:'external', external: {url:'waka'}}}, row);
            expect(row.avatar).toBe('waka');
        });

        test('toPage(...) should work', () => {
            const page: any = {id:'final', icon: undefined};
            property.toPage({id:'', avatar: 'waka'}, page)
            expect(page.icon).not.toBeNull();
            expect(page.icon.external).not.toBeNull();
            expect(page.icon.external.url).toBe('waka');
        });
    });

    describe('url', () => {
        type Urly = {web: string} & Entity;
        const property = url<Urly, 'web'>('Web', 'web');

        test('changed(...) should be false, always', () => {
            expect(property.changed({web:'123', id:''}, {web:'123', id:''})).toBeFalsy();
            expect(property.changed({web:'123', id:''}, {web:'456', id:''})).toBeTruthy();
        });

        test('fromPage(...) should work', async () => {
            const row: Urly = {id:'', web:''}
            await property.fromPage({properties: {Web: {url:'waka'}}}, row);
            expect(row.web).toBe('waka');
        });

        test('toPage(...) should work', () => {
            const page: any = {id:'final', properties: {}};
            property.toPage({id:'', web: 'waka'}, page)
            expect(page.properties).not.toBeNull();
            expect(page.properties.Web).not.toBeNull();
            expect(page.properties.Web.url).toBe('waka');
        });
    });
});