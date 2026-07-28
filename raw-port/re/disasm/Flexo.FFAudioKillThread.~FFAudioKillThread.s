__ZN17FFAudioKillThreadD0Ev:
0000000000d0b040	pushq	%rbp
0000000000d0b041	movq	%rsp, %rbp
0000000000d0b044	pushq	%rbx
0000000000d0b045	pushq	%rax
0000000000d0b046	movq	%rdi, %rbx
0000000000d0b049	callq	__ZN12WorkerThreadD2Ev          ## WorkerThread::~WorkerThread()
0000000000d0b04e	movq	%rbx, %rdi
0000000000d0b051	addq	$0x8, %rsp
0000000000d0b055	popq	%rbx
0000000000d0b056	popq	%rbp
0000000000d0b057	jmp	0x1497404                       ## symbol stub for: __ZdlPv
0000000000d0b05c	nopl	(%rax)
