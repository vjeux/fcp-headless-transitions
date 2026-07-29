__ZNK16OZChannelScale3D5cloneEv:
0000000000086d92	pushq	%rbp
0000000000086d93	movq	%rsp, %rbp
0000000000086d96	pushq	%r14
0000000000086d98	pushq	%rbx
0000000000086d99	movq	%rdi, %r14
0000000000086d9c	movl	$0x250, %edi                    ## imm = 0x250
0000000000086da1	callq	0xace4c                         ## symbol stub for: __Znwm
0000000000086da6	movq	%rax, %rbx
0000000000086da9	movq	%rax, %rdi
0000000000086dac	movq	%r14, %rsi
0000000000086daf	xorl	%edx, %edx
0000000000086db1	callq	__ZN16OZChannelScale3DC2ERKS_P15OZChannelFolder ## OZChannelScale3D::OZChannelScale3D(OZChannelScale3D const&, OZChannelFolder*)
0000000000086db6	movq	%rbx, %rax
0000000000086db9	popq	%rbx
0000000000086dba	popq	%r14
0000000000086dbc	popq	%rbp
0000000000086dbd	retq
0000000000086dbe	movq	%rax, %r14
0000000000086dc1	movq	%rbx, %rdi
0000000000086dc4	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000086dc9	movq	%r14, %rdi
0000000000086dcc	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
0000000000086dd1	nop
