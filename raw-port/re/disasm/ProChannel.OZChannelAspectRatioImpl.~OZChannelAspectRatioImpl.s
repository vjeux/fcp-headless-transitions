__ZN24OZChannelAspectRatioImplD0Ev:
0000000000006172	pushq	%rbp
0000000000006173	movq	%rsp, %rbp
0000000000006176	pushq	%rbx
0000000000006177	pushq	%rax
0000000000006178	movq	%rdi, %rbx
000000000000617b	addq	$0x28, %rdi
000000000000617f	callq	0xacb4c                         ## symbol stub for: __ZN11PCSingletonD2Ev
0000000000006184	movq	%rbx, %rdi
0000000000006187	callq	__ZN13OZChannelImplD2Ev         ## OZChannelImpl::~OZChannelImpl()
000000000000618c	movq	%rbx, %rdi
000000000000618f	addq	$0x8, %rsp
0000000000006193	popq	%rbx
0000000000006194	popq	%rbp
0000000000006195	jmp	0xace04                         ## symbol stub for: __ZdlPv
