__ZN19OZChannelButtonInfoD0Ev:
00000000000541a4	pushq	%rbp
00000000000541a5	movq	%rsp, %rbp
00000000000541a8	pushq	%rbx
00000000000541a9	pushq	%rax
00000000000541aa	movq	%rdi, %rbx
00000000000541ad	addq	$0x50, %rdi
00000000000541b1	callq	0xacb4c                         ## symbol stub for: __ZN11PCSingletonD2Ev
00000000000541b6	movq	%rbx, %rdi
00000000000541b9	callq	__ZN13OZChannelInfoD2Ev         ## OZChannelInfo::~OZChannelInfo()
00000000000541be	movq	%rbx, %rdi
00000000000541c1	addq	$0x8, %rsp
00000000000541c5	popq	%rbx
00000000000541c6	popq	%rbp
00000000000541c7	jmp	0xace04                         ## symbol stub for: __ZdlPv
