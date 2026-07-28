__ZN17PCSystemExceptionD0Ev:
0000000000034852	pushq	%rbp
0000000000034853	movq	%rsp, %rbp
0000000000034856	pushq	%rbx
0000000000034857	pushq	%rax
0000000000034858	movq	%rdi, %rbx
000000000003485b	callq	__ZN11PCExceptionD2Ev           ## PCException::~PCException()
0000000000034860	movq	%rbx, %rdi
0000000000034863	addq	$0x8, %rsp
0000000000034867	popq	%rbx
0000000000034868	popq	%rbp
0000000000034869	jmp	0xde6c0                         ## symbol stub for: __ZdlPv
