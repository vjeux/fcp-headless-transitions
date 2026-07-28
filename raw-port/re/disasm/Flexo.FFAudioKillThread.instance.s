__ZN17FFAudioKillThread8instanceEv:
0000000000d0aeb0	cmpq	$-0x1, __ZZN17FFAudioKillThread8instanceEvE9predicate(%rip) ## FFAudioKillThread::instance()::predicate
0000000000d0aeb8	jne	0xd0aec2
0000000000d0aeba	movq	__ZN17FFAudioKillThread10s_instanceE(%rip), %rax ## FFAudioKillThread::s_instance
0000000000d0aec1	retq
0000000000d0aec2	pushq	%rbp
0000000000d0aec3	movq	%rsp, %rbp
0000000000d0aec6	callq	__ZN17FFAudioKillThread8instanceEv.cold.1 ## FFAudioKillThread::instance() (.cold.1)
0000000000d0aecb	popq	%rbp
0000000000d0aecc	movq	__ZN17FFAudioKillThread10s_instanceE(%rip), %rax ## FFAudioKillThread::s_instance
0000000000d0aed3	retq
0000000000d0aed4	nopw	%cs:(%rax,%rax)
