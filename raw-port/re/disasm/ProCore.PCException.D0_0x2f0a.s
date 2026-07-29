0000000000002f0a	pushq	%rbp
0000000000002f0b	movq	%rsp, %rbp
0000000000002f0e	pushq	%rbx
0000000000002f0f	pushq	%rax
0000000000002f10	movq	%rdi, %rbx
0000000000002f13	callq	__ZN11PCExceptionD2Ev           ## PCException::~PCException()
0000000000002f18	movq	%rbx, %rdi
0000000000002f1b	addq	$0x8, %rsp
0000000000002f1f	popq	%rbx
0000000000002f20	popq	%rbp
0000000000002f21	jmp	0xde6c0                         ## symbol stub for: __ZdlPv
