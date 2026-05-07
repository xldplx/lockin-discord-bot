const daily = require('./commands/daily');
const stats = require('./commands/stats');
const utility = require('./commands/utility');
const pomodoro = require('./commands/pomodoro');

const commands = {
    // Chat Input Commands
    'daily': daily.handleCommand,
    'history': stats.handleHistory,
    'stats': stats.handleStats,
    'ping': utility.handlePing,
    'help': utility.handleHelp,
    'test': utility.handleTest,
    'pomodoro': pomodoro.handleCommand,
    'stop': pomodoro.handleStop,

    // Modal Submissions
    'dailyCheckinModal': daily.handleModal
};

module.exports = commands;
