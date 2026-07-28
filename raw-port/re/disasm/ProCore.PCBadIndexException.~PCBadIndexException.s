__ZN19PCBadIndexExceptionD0Ev:
00000000000c4d60	pushq	%rbp
00000000000c4d61	movq	%rsp, %rbp
00000000000c4d64	pushq	%rbx
00000000000c4d65	pushq	%rax
00000000000c4d66	movq	%rdi, %rbx
00000000000c4d69	callq	__ZN11PCExceptionD2Ev           ## PCException::~PCException()
00000000000c4d6e	movq	%rbx, %rdi
00000000000c4d71	addq	$0x8, %rsp
00000000000c4d75	popq	%rbx
00000000000c4d76	popq	%rbp
00000000000c4d77	jmp	0xde6c0                         ## symbol stub for: __ZdlPv
