__ZNK15OZChannelBool3D5cloneEv:
0000000000053522	pushq	%rbp
0000000000053523	movq	%rsp, %rbp
0000000000053526	pushq	%r14
0000000000053528	pushq	%rbx
0000000000053529	movq	%rdi, %r14
000000000005352c	movl	$0x250, %edi                    ## imm = 0x250
0000000000053531	callq	0xace4c                         ## symbol stub for: __Znwm
0000000000053536	movq	%rax, %rbx
0000000000053539	movq	%rax, %rdi
000000000005353c	movq	%r14, %rsi
000000000005353f	xorl	%edx, %edx
0000000000053541	callq	__ZN15OZChannelBool3DC2ERKS_P15OZChannelFolder ## OZChannelBool3D::OZChannelBool3D(OZChannelBool3D const&, OZChannelFolder*)
0000000000053546	movq	%rbx, %rax
0000000000053549	popq	%rbx
000000000005354a	popq	%r14
000000000005354c	popq	%rbp
000000000005354d	retq
000000000005354e	movq	%rax, %r14
0000000000053551	movq	%rbx, %rdi
0000000000053554	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000053559	movq	%r14, %rdi
000000000005355c	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000053561	nop
