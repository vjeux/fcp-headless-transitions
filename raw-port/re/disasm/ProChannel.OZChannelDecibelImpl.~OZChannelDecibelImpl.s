__ZN20OZChannelDecibelImplD0Ev:
00000000000107a4	pushq	%rbp
00000000000107a5	movq	%rsp, %rbp
00000000000107a8	pushq	%rbx
00000000000107a9	pushq	%rax
00000000000107aa	movq	%rdi, %rbx
00000000000107ad	addq	$0x28, %rdi
00000000000107b1	callq	0xacb4c                         ## symbol stub for: __ZN11PCSingletonD2Ev
00000000000107b6	movq	%rbx, %rdi
00000000000107b9	callq	__ZN13OZChannelImplD2Ev         ## OZChannelImpl::~OZChannelImpl()
00000000000107be	movq	%rbx, %rdi
00000000000107c1	addq	$0x8, %rsp
00000000000107c5	popq	%rbx
00000000000107c6	popq	%rbp
00000000000107c7	jmp	0xace04                         ## symbol stub for: __ZdlPv
