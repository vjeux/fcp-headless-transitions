__ZN23PCDivideByZeroExceptionD0Ev:
000000000006789a	pushq	%rbp
000000000006789b	movq	%rsp, %rbp
000000000006789e	pushq	%rbx
000000000006789f	pushq	%rax
00000000000678a0	movq	%rdi, %rbx
00000000000678a3	callq	__ZN11PCExceptionD2Ev           ## PCException::~PCException()
00000000000678a8	movq	%rbx, %rdi
00000000000678ab	addq	$0x8, %rsp
00000000000678af	popq	%rbx
00000000000678b0	popq	%rbp
00000000000678b1	jmp	0xde6c0                         ## symbol stub for: __ZdlPv
