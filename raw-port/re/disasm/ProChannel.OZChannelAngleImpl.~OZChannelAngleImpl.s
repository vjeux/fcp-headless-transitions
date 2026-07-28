__ZN18OZChannelAngleImplD1Ev:  # entry @0x84c5c (prologue bytes 55 48 89 e5 = pushq %rbp; movq %rsp,%rbp — otool did not emit a label due to linear-sweep misalignment; instructions decoded from @0x84c5e onward)
0000000000084c5e	movl	%esp, %ebp
0000000000084c60	pushq	%rbx
0000000000084c61	pushq	%rax
0000000000084c62	movq	%rdi, %rbx
0000000000084c65	addq	$0x28, %rdi
0000000000084c69	callq	0xacb4c                         ## symbol stub for: __ZN11PCSingletonD2Ev
0000000000084c6e	movq	%rbx, %rdi
0000000000084c71	addq	$0x8, %rsp
0000000000084c75	popq	%rbx
0000000000084c76	popq	%rbp
0000000000084c77	jmp	__ZN13OZChannelImplD2Ev         ## OZChannelImpl::~OZChannelImpl()
__ZN18OZChannelAngleImplD0Ev:
0000000000084c7c	pushq	%rbp
0000000000084c7d	movq	%rsp, %rbp
0000000000084c80	pushq	%rbx
0000000000084c81	pushq	%rax
0000000000084c82	movq	%rdi, %rbx
0000000000084c85	addq	$0x28, %rdi
0000000000084c89	callq	0xacb4c                         ## symbol stub for: __ZN11PCSingletonD2Ev
0000000000084c8e	movq	%rbx, %rdi
0000000000084c91	callq	__ZN13OZChannelImplD2Ev         ## OZChannelImpl::~OZChannelImpl()
0000000000084c96	movq	%rbx, %rdi
0000000000084c99	addq	$0x8, %rsp
0000000000084c9d	popq	%rbx
0000000000084c9e	popq	%rbp
0000000000084c9f	jmp	0xace04                         ## symbol stub for: __ZdlPv
