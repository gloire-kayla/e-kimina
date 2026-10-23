import {test} from 'node:test';
import assert from 'node:assert/strict';
import {groupData} from '../src/groups.mjs';
test('group setup accepts both methods and validates monetary and term boundaries',()=>{const input={name:' New group ',contribution:'1000',goal:'100000',rate:'2,25',term:'3',interestMethod:'flat'};assert.deepEqual(groupData(input),{name:'New group',contribution:1000,goal:100000,rate:2.25,term:3,frequency:'monthly',interestMethod:'flat'});assert.equal(groupData({...input,interestMethod:'reducing'}).interestMethod,'reducing');for(const change of [{name:' '},{contribution:'1.5'},{goal:'0'},{rate:''},{rate:'101'},{rate:'0.001'},{term:'61'},{interestMethod:'unknown'}])assert.throws(()=>groupData({...input,...change}),/invalidGroup/);});
