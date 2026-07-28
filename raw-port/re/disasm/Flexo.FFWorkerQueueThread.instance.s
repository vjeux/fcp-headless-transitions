__ZN19FFWorkerQueueThread8instanceEv:
0000000001304ab0	cmpq	$-0x1, __ZZN19FFWorkerQueueThread8instanceEvE11s_predicate(%rip) ## FFWorkerQueueThread::instance()::s_predicate
0000000001304ab8	jne	0x1304ac2
0000000001304aba	movq	__ZZN19FFWorkerQueueThread8instanceEvE10s_instance(%rip), %rax ## FFWorkerQueueThread::instance()::s_instance
0000000001304ac1	retq
0000000001304ac2	pushq	%rbp
0000000001304ac3	movq	%rsp, %rbp
0000000001304ac6	callq	__ZN13FFWorkerQueue7addTaskEPNS_4TaskE.cold.1 ## FFWorkerQueue::addTask(FFWorkerQueue::Task*) (.cold.1)
0000000001304acb	popq	%rbp
0000000001304acc	movq	__ZZN19FFWorkerQueueThread8instanceEvE10s_instance(%rip), %rax ## FFWorkerQueueThread::instance()::s_instance
0000000001304ad3	retq
0000000001304ad4	nopw	%cs:(%rax,%rax)
