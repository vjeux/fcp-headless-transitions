__ZN15OZSimStateArray8stepFromEPS_S0_6CMTimed:
0000000000284050	pushq	%rbp
0000000000284051	movq	%rsp, %rbp
0000000000284054	pushq	%r15
0000000000284056	pushq	%r14
0000000000284058	pushq	%r13
000000000028405a	pushq	%r12
000000000028405c	pushq	%rbx
000000000028405d	subq	$0xc8, %rsp
0000000000284064	movq	%rsi, -0x30(%rbp)
0000000000284068	movq	(%rdi), %r15
000000000028406b	movq	%rdi, -0x38(%rbp)
000000000028406f	cmpq	0x8(%rdi), %r15
0000000000284073	je	0x28410f
0000000000284079	movq	-0x30(%rbp), %rax
000000000028407d	movq	(%rax), %r12
0000000000284080	movq	(%rdx), %r13
0000000000284083	leaq	-0xb0(%rbp), %r14
000000000028408a	movabsq	$0x3ff0000000000000, %rbx       ## imm = 0x3FF0000000000000
0000000000284094	movsd	%xmm0, -0x58(%rbp)
0000000000284099	nopl	(%rax)
00000000002840a0	movq	%rbx, -0xb8(%rbp)
00000000002840a7	xorps	%xmm0, %xmm0
00000000002840aa	movups	%xmm0, (%r14)
00000000002840ae	movq	$0x0, 0x10(%r14)
00000000002840b6	movq	%rbx, -0x98(%rbp)
00000000002840bd	movups	%xmm0, 0x20(%r14)
00000000002840c2	movq	$0x0, 0x30(%r14)
00000000002840ca	movq	%rbx, -0x78(%rbp)
00000000002840ce	movq	%r15, %rdi
00000000002840d1	movq	%r12, %rsi
00000000002840d4	movq	%r13, %rdx
00000000002840d7	movsd	-0x58(%rbp), %xmm0
00000000002840dc	movsd	0x4812fc(%rip), %xmm1
00000000002840e4	leaq	-0xb8(%rbp), %rcx
00000000002840eb	callq	__ZN17OZSimStateElement8stepFromEPS_S0_dd14PCMatrix33TmplIdE ## OZSimStateElement::stepFrom(OZSimStateElement*, OZSimStateElement*, double, double, PCMatrix33Tmpl<double>)
00000000002840f0	addq	$0xf8, %r15
00000000002840f7	addq	$0xf8, %r12
00000000002840fe	addq	$0xf8, %r13
0000000000284105	movq	-0x38(%rbp), %rax
0000000000284109	cmpq	0x8(%rax), %r15
000000000028410d	jne	0x2840a0
000000000028410f	movq	-0x30(%rbp), %r12
0000000000284113	movq	0x28(%r12), %rax
0000000000284118	movq	%rax, -0x40(%rbp)
000000000028411c	movups	0x18(%r12), %xmm0
0000000000284122	movaps	%xmm0, -0x50(%rbp)
0000000000284126	leaq	0x10(%rbp), %rcx
000000000028412a	movq	0x10(%rcx), %rax
000000000028412e	movq	%rax, 0x28(%rsp)
0000000000284133	movups	(%rcx), %xmm0
0000000000284136	movups	%xmm0, 0x18(%rsp)
000000000028413b	movq	-0x40(%rbp), %rax
000000000028413f	movq	%rax, 0x10(%rsp)
0000000000284144	movaps	-0x50(%rbp), %xmm0
0000000000284148	movups	%xmm0, (%rsp)
000000000028414c	leaq	-0x70(%rbp), %rdi
0000000000284150	callq	0x6dcf06                        ## symbol stub for: _PC_CMTimeSaferAdd
0000000000284155	movq	-0x60(%rbp), %rax
0000000000284159	movq	-0x38(%rbp), %rbx
000000000028415d	movq	%rax, 0x28(%rbx)
0000000000284161	movups	-0x70(%rbp), %xmm0
0000000000284165	movups	%xmm0, 0x18(%rbx)
0000000000284169	movq	0x38(%r12), %rax
000000000028416e	movq	%rax, 0x38(%rbx)
0000000000284172	leaq	0x40(%rbx), %r14
0000000000284176	addq	$0x40, %r12
000000000028417a	leaq	-0x50(%rbp), %r15
000000000028417e	movq	%r15, %rdi
0000000000284181	movq	%r12, %rsi
0000000000284184	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
0000000000284189	movq	%r14, %rdi
000000000028418c	movq	%r15, %rsi
000000000028418f	callq	0x6ddaf4                        ## symbol stub for: __ZN13PCSharedCountaSES_
0000000000284194	leaq	-0x50(%rbp), %rdi
0000000000284198	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000028419d	movb	$0x0, 0x30(%rbx)
00000000002841a1	addq	$0xc8, %rsp
00000000002841a8	popq	%rbx
00000000002841a9	popq	%r12
00000000002841ab	popq	%r13
00000000002841ad	popq	%r14
00000000002841af	popq	%r15
00000000002841b1	popq	%rbp
00000000002841b2	retq
00000000002841b3	movq	%rax, %rbx
00000000002841b6	leaq	-0x50(%rbp), %rdi
00000000002841ba	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000002841bf	movq	%rbx, %rdi
00000000002841c2	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000002841c7	nopw	(%rax,%rax)
