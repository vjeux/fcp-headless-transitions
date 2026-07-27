__ZNK17OZChannelPosition5cloneEv:
0000000000073f62	pushq	%rbp
0000000000073f63	movq	%rsp, %rbp
0000000000073f66	pushq	%r14
0000000000073f68	pushq	%rbx
0000000000073f69	movq	%rdi, %r14
0000000000073f6c	movl	$0x2c0, %edi                    ## imm = 0x2C0
0000000000073f71	callq	0xace4c                         ## symbol stub for: __Znwm
0000000000073f76	movq	%rax, %rbx
0000000000073f79	movq	%rax, %rdi
0000000000073f7c	movq	%r14, %rsi
0000000000073f7f	xorl	%edx, %edx
0000000000073f81	callq	__ZN11OZChannel2DC2ERKS_P15OZChannelFolder ## OZChannel2D::OZChannel2D(OZChannel2D const&, OZChannelFolder*)
0000000000073f86	leaq	0x6909b(%rip), %rax
0000000000073f8d	movq	%rax, (%rbx)
0000000000073f90	leaq	0x693d9(%rip), %rax
0000000000073f97	movq	%rax, 0x10(%rbx)
0000000000073f9b	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
0000000000073fa5	movq	%rax, 0x238(%rbx)
0000000000073fac	movq	%rax, 0x210(%rbx)
0000000000073fb3	movq	%rax, 0x1e8(%rbx)
0000000000073fba	movq	%rax, 0x1c0(%rbx)
0000000000073fc1	xorps	%xmm0, %xmm0
0000000000073fc4	movups	%xmm0, 0x1c8(%rbx)
0000000000073fcb	movups	%xmm0, 0x1d8(%rbx)
0000000000073fd2	movups	%xmm0, 0x1f0(%rbx)
0000000000073fd9	movups	%xmm0, 0x200(%rbx)
0000000000073fe0	movups	%xmm0, 0x218(%rbx)
0000000000073fe7	movups	%xmm0, 0x228(%rbx)
0000000000073fee	movups	%xmm0, 0x240(%rbx)
0000000000073ff5	movups	%xmm0, 0x250(%rbx)
0000000000073ffc	movups	%xmm0, 0x260(%rbx)
0000000000074003	movups	%xmm0, 0x270(%rbx)
000000000007400a	movups	%xmm0, 0x280(%rbx)
0000000000074011	movups	%xmm0, 0x290(%rbx)
0000000000074018	movups	%xmm0, 0x2a0(%rbx)
000000000007401f	movups	%xmm0, 0x2b0(%rbx)
0000000000074026	movb	0x1b8(%r14), %al
000000000007402d	movb	%al, 0x1b8(%rbx)
0000000000074033	movq	%rbx, %rax
0000000000074036	popq	%rbx
0000000000074037	popq	%r14
0000000000074039	popq	%rbp
000000000007403a	retq
000000000007403b	movq	%rax, %r14
000000000007403e	movq	%rbx, %rdi
0000000000074041	callq	0xace04                         ## symbol stub for: __ZdlPv
0000000000074046	movq	%r14, %rdi
0000000000074049	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
