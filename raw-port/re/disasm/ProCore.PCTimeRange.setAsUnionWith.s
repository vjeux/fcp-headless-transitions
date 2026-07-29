__ZN11PCTimeRange14setAsUnionWithERKS_RK6CMTime:
000000000001f80e	pushq	%rbp
000000000001f80f	movq	%rsp, %rbp
000000000001f812	pushq	%r15
000000000001f814	pushq	%r14
000000000001f816	pushq	%r13
000000000001f818	pushq	%r12
000000000001f81a	pushq	%rbx
000000000001f81b	subq	$0x108, %rsp                    ## imm = 0x108
000000000001f822	movq	%rdx, %r14
000000000001f825	movq	%rsi, %r12
000000000001f828	movq	%rdi, %rbx
000000000001f82b	movq	0x10(%rdi), %rax
000000000001f82f	leaq	-0xb0(%rbp), %r13
000000000001f836	movq	%rax, 0x10(%r13)
000000000001f83a	movups	(%rdi), %xmm0
000000000001f83d	movaps	%xmm0, (%r13)
000000000001f842	movq	0x10(%rsi), %rax
000000000001f846	leaq	-0x90(%rbp), %rcx
000000000001f84d	movq	%rax, 0x10(%rcx)
000000000001f851	movups	(%rsi), %xmm0
000000000001f854	movaps	%xmm0, (%rcx)
000000000001f857	movq	0x10(%rdi), %rax
000000000001f85b	movq	%rax, -0x30(%rbp)
000000000001f85f	movups	(%rdi), %xmm0
000000000001f862	movaps	%xmm0, -0x40(%rbp)
000000000001f866	movq	0x10(%rsi), %rax
000000000001f86a	leaq	-0xd0(%rbp), %r15
000000000001f871	movq	%rax, 0x10(%r15)
000000000001f875	movups	(%rsi), %xmm0
000000000001f878	movaps	%xmm0, (%r15)
000000000001f87c	movq	0x10(%r15), %rax
000000000001f880	movq	%rax, 0x28(%rsp)
000000000001f885	movaps	(%r15), %xmm0
000000000001f889	movups	%xmm0, 0x18(%rsp)
000000000001f88e	movq	-0x30(%rbp), %rax
000000000001f892	movq	%rax, 0x10(%rsp)
000000000001f897	movaps	-0x40(%rbp), %xmm0
000000000001f89b	movups	%xmm0, (%rsp)
000000000001f89f	callq	0xde3a8                         ## symbol stub for: _CMTimeCompare
000000000001f8a4	testl	%eax, %eax
000000000001f8a6	leaq	-0x90(%rbp), %rax
000000000001f8ad	cmovgq	%rax, %r13
000000000001f8b1	movups	(%r13), %xmm0
000000000001f8b6	movaps	%xmm0, -0x60(%rbp)
000000000001f8ba	movq	0x10(%r13), %rax
000000000001f8be	movq	%rax, -0x50(%rbp)
000000000001f8c2	movq	0x10(%rbx), %rax
000000000001f8c6	movq	%rax, -0x30(%rbp)
000000000001f8ca	movups	(%rbx), %xmm0
000000000001f8cd	movaps	%xmm0, -0x40(%rbp)
000000000001f8d1	movq	0x28(%rbx), %rax
000000000001f8d5	movq	%rax, 0x10(%r15)
000000000001f8d9	movups	0x18(%rbx), %xmm0
000000000001f8dd	movaps	%xmm0, (%r15)
000000000001f8e1	movq	0x10(%r15), %rax
000000000001f8e5	movq	%rax, 0x28(%rsp)
000000000001f8ea	movaps	(%r15), %xmm0
000000000001f8ee	movups	%xmm0, 0x18(%rsp)
000000000001f8f3	movq	-0x30(%rbp), %rax
000000000001f8f7	movq	%rax, 0x10(%rsp)
000000000001f8fc	movaps	-0x40(%rbp), %xmm0
000000000001f900	movups	%xmm0, (%rsp)
000000000001f904	leaq	-0x78(%rbp), %r13
000000000001f908	movq	%r13, %rdi
000000000001f90b	callq	_PC_CMTimeSaferAdd
000000000001f910	movq	0x10(%r14), %rax
000000000001f914	movq	%rax, -0x30(%rbp)
000000000001f918	movups	(%r14), %xmm0
000000000001f91c	movaps	%xmm0, -0x40(%rbp)
000000000001f920	movq	-0x30(%rbp), %rax
000000000001f924	movq	%rax, 0x28(%rsp)
000000000001f929	movaps	-0x40(%rbp), %xmm0
000000000001f92d	movups	%xmm0, 0x18(%rsp)
000000000001f932	movq	0x10(%r13), %rax
000000000001f936	movq	%rax, 0x10(%rsp)
000000000001f93b	movups	(%r13), %xmm0
000000000001f940	movups	%xmm0, (%rsp)
000000000001f944	leaq	-0x100(%rbp), %r13
000000000001f94b	movq	%r13, %rdi
000000000001f94e	callq	_PC_CMTimeSaferSubtract
000000000001f953	movq	0x10(%r12), %rax
000000000001f958	movq	%rax, -0x30(%rbp)
000000000001f95c	movups	(%r12), %xmm0
000000000001f961	movaps	%xmm0, -0x40(%rbp)
000000000001f965	movq	0x28(%r12), %rax
000000000001f96a	movq	%rax, 0x10(%r15)
000000000001f96e	movups	0x18(%r12), %xmm0
000000000001f974	movaps	%xmm0, (%r15)
000000000001f978	movq	0x10(%r15), %rax
000000000001f97c	movq	%rax, 0x28(%rsp)
000000000001f981	movaps	(%r15), %xmm0
000000000001f985	movups	%xmm0, 0x18(%rsp)
000000000001f98a	movq	-0x30(%rbp), %rax
000000000001f98e	movq	%rax, 0x10(%rsp)
000000000001f993	movaps	-0x40(%rbp), %xmm0
000000000001f997	movups	%xmm0, (%rsp)
000000000001f99b	leaq	-0x78(%rbp), %r12
000000000001f99f	movq	%r12, %rdi
000000000001f9a2	callq	_PC_CMTimeSaferAdd
000000000001f9a7	movq	0x10(%r14), %rax
000000000001f9ab	movq	%rax, -0x30(%rbp)
000000000001f9af	movups	(%r14), %xmm0
000000000001f9b3	movaps	%xmm0, -0x40(%rbp)
000000000001f9b7	movq	-0x30(%rbp), %rax
000000000001f9bb	movq	%rax, 0x28(%rsp)
000000000001f9c0	movaps	-0x40(%rbp), %xmm0
000000000001f9c4	movups	%xmm0, 0x18(%rsp)
000000000001f9c9	movq	0x10(%r12), %rax
000000000001f9ce	movq	%rax, 0x10(%rsp)
000000000001f9d3	movups	(%r12), %xmm0
000000000001f9d8	movups	%xmm0, (%rsp)
000000000001f9dc	leaq	-0xe8(%rbp), %r12
000000000001f9e3	movq	%r12, %rdi
000000000001f9e6	callq	_PC_CMTimeSaferSubtract
000000000001f9eb	movq	0x10(%r12), %rax
000000000001f9f0	movq	%rax, 0x28(%rsp)
000000000001f9f5	movups	(%r12), %xmm0
000000000001f9fa	movups	%xmm0, 0x18(%rsp)
000000000001f9ff	movq	0x10(%r13), %rax
000000000001fa03	movq	%rax, 0x10(%rsp)
000000000001fa08	movups	(%r13), %xmm0
000000000001fa0d	movups	%xmm0, (%rsp)
000000000001fa11	callq	0xde3a8                         ## symbol stub for: _CMTimeCompare
000000000001fa16	testl	%eax, %eax
000000000001fa18	cmovsq	%r12, %r13
000000000001fa1c	movaps	-0x60(%rbp), %xmm0
000000000001fa20	movups	%xmm0, (%rbx)
000000000001fa23	movq	-0x50(%rbp), %rax
000000000001fa27	movq	%rax, 0x10(%rbx)
000000000001fa2b	movq	-0x50(%rbp), %rax
000000000001fa2f	movq	%rax, 0x28(%rsp)
000000000001fa34	movaps	-0x60(%rbp), %xmm0
000000000001fa38	movups	%xmm0, 0x18(%rsp)
000000000001fa3d	movq	0x10(%r13), %rax
000000000001fa41	movq	%rax, 0x10(%rsp)
000000000001fa46	movups	(%r13), %xmm0
000000000001fa4b	movups	%xmm0, (%rsp)
000000000001fa4f	leaq	-0x78(%rbp), %r12
000000000001fa53	movq	%r12, %rdi
000000000001fa56	callq	_PC_CMTimeSaferSubtract
000000000001fa5b	movq	0x10(%r14), %rax
000000000001fa5f	movq	%rax, -0x30(%rbp)
000000000001fa63	movups	(%r14), %xmm0
000000000001fa67	movaps	%xmm0, -0x40(%rbp)
000000000001fa6b	movq	-0x30(%rbp), %rax
000000000001fa6f	movq	%rax, 0x28(%rsp)
000000000001fa74	movaps	-0x40(%rbp), %xmm0
000000000001fa78	movups	%xmm0, 0x18(%rsp)
000000000001fa7d	movq	0x10(%r12), %rax
000000000001fa82	movq	%rax, 0x10(%rsp)
000000000001fa87	movups	(%r12), %xmm0
000000000001fa8c	movups	%xmm0, (%rsp)
000000000001fa90	movq	%r15, %rdi
000000000001fa93	callq	_PC_CMTimeSaferAdd
000000000001fa98	movq	0x10(%r15), %rax
000000000001fa9c	movq	%rax, 0x28(%rbx)
000000000001faa0	movups	(%r15), %xmm0
000000000001faa4	movups	%xmm0, 0x18(%rbx)
000000000001faa8	addq	$0x108, %rsp                    ## imm = 0x108
000000000001faaf	popq	%rbx
000000000001fab0	popq	%r12
000000000001fab2	popq	%r13
000000000001fab4	popq	%r14
000000000001fab6	popq	%r15
000000000001fab8	popq	%rbp
000000000001fab9	retq
