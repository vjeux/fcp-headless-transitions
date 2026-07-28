__ZN19OZCollisionBehavior16handleCollisionsEP15OZTransformNodeP15OZSimStateArrayS3_bPb:
00000000001db870	pushq	%rbp
00000000001db871	movq	%rsp, %rbp
00000000001db874	pushq	%r15
00000000001db876	pushq	%r14
00000000001db878	pushq	%r13
00000000001db87a	pushq	%r12
00000000001db87c	pushq	%rbx
00000000001db87d	subq	$0x208, %rsp                    ## imm = 0x208
00000000001db884	movq	%r9, -0x70(%rbp)
00000000001db888	movl	%r8d, -0x2c(%rbp)
00000000001db88c	movq	%rsi, -0x68(%rbp)
00000000001db890	movq	%rdi, -0x60(%rbp)
00000000001db894	movq	(%rcx), %rdi
00000000001db897	movq	%rcx, -0x38(%rbp)
00000000001db89b	cmpq	0x8(%rcx), %rdi
00000000001db89f	je	0x1dbc03
00000000001db8a5	movq	(%rdx), %rsi
00000000001db8a8	leaq	-0x130(%rbp), %r14
00000000001db8af	leaq	-0x210(%rbp), %rbx
00000000001db8b6	movq	-0x38(%rbp), %rax
00000000001db8ba	addq	$0x18, %rax
00000000001db8be	movq	%rax, -0x48(%rbp)
00000000001db8c2	addq	$0x18, %rdx
00000000001db8c6	movq	%rdx, -0x58(%rbp)
00000000001db8ca	movl	$0x20, %r12d
00000000001db8d0	leaq	-0x150(%rbp), %r13
00000000001db8d7	leaq	-0x230(%rbp), %rdx
00000000001db8de	movq	%rsi, -0x50(%rbp)
00000000001db8e2	movq	%rdi, -0x40(%rbp)
00000000001db8e6	jmp	0x1db980
00000000001db8eb	nopl	(%rax,%rax)
00000000001db8f0	movq	0x28(%r14), %rax
00000000001db8f4	movq	%rax, 0x48(%r15)
00000000001db8f8	movups	0x18(%r14), %xmm0
00000000001db8fd	movups	%xmm0, 0x38(%r15)
00000000001db902	movq	0x40(%r14), %rax
00000000001db906	movq	%rax, 0x60(%r15)
00000000001db90a	movups	0x30(%r14), %xmm0
00000000001db90f	movups	%xmm0, 0x50(%r15)
00000000001db914	movq	0x58(%r14), %rax
00000000001db918	movq	%rax, 0x78(%r15)
00000000001db91c	movups	0x48(%r14), %xmm0
00000000001db921	movups	%xmm0, 0x68(%r15)
00000000001db926	movq	0x70(%r14), %rax
00000000001db92a	movq	%rax, 0x90(%r15)
00000000001db931	movups	0x60(%r14), %xmm0
00000000001db936	movups	%xmm0, 0x80(%r15)
00000000001db93e	movups	0x78(%r14), %xmm0
00000000001db943	movups	%xmm0, 0x98(%r15)
00000000001db94b	movq	0x88(%r14), %rax
00000000001db952	movq	%rax, 0xa8(%r15)
00000000001db959	addq	$0xf8, %r12
00000000001db960	addq	$0xf8, %r15
00000000001db967	movq	-0x38(%rbp), %rax
00000000001db96b	cmpq	0x8(%rax), %r15
00000000001db96f	movq	-0x50(%rbp), %rsi
00000000001db973	leaq	-0x230(%rbp), %rdx
00000000001db97a	je	0x1dbc03
00000000001db980	leaq	(%rdi,%r12), %r15
00000000001db984	addq	$-0x20, %r15
00000000001db988	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000001db992	movq	%rax, -0x138(%rbp)
00000000001db999	xorps	%xmm0, %xmm0
00000000001db99c	movups	%xmm0, (%r14)
00000000001db9a0	movq	$0x0, 0x10(%r14)
00000000001db9a8	movq	%rax, -0x218(%rbp)
00000000001db9af	movups	%xmm0, 0xa8(%rbx)
00000000001db9b6	movq	$0x0, 0xb8(%rbx)
00000000001db9c1	movups	%xmm0, 0x80(%rbx)
00000000001db9c8	movups	%xmm0, 0x70(%rbx)
00000000001db9cc	movups	%xmm0, 0x60(%rbx)
00000000001db9d0	movups	%xmm0, 0x50(%rbx)
00000000001db9d4	movups	%xmm0, 0x40(%rbx)
00000000001db9d8	movups	%xmm0, 0x30(%rbx)
00000000001db9dc	movups	%xmm0, 0x20(%rbx)
00000000001db9e0	movups	%xmm0, 0x10(%rbx)
00000000001db9e4	movups	%xmm0, (%rbx)
00000000001db9e7	movq	-0x10(%rdi,%r12), %rax
00000000001db9ec	movq	%rax, -0x140(%rbp)
00000000001db9f3	movups	-0x20(%rdi,%r12), %xmm0
00000000001db9f9	movaps	%xmm0, -0x150(%rbp)
00000000001dba00	cmpq	%r13, %r15
00000000001dba03	je	0x1dba26
00000000001dba05	movsd	-0x8(%rdi,%r12), %xmm0
00000000001dba0c	movsd	%xmm0, -0x138(%rbp)
00000000001dba14	movq	0x10(%rdi,%r12), %rax
00000000001dba19	movq	%rax, 0x10(%r14)
00000000001dba1d	movups	(%rdi,%r12), %xmm0
00000000001dba22	movups	%xmm0, (%r14)
00000000001dba26	leaq	(%rsi,%r12), %rax
00000000001dba2a	addq	$-0x20, %rax
00000000001dba2e	movq	0x48(%r15), %rcx
00000000001dba32	movq	%rcx, 0x28(%r14)
00000000001dba36	movups	0x38(%r15), %xmm0
00000000001dba3b	movups	%xmm0, 0x18(%r14)
00000000001dba40	movq	0x60(%r15), %rcx
00000000001dba44	movq	%rcx, 0x40(%r14)
00000000001dba48	movups	0x50(%r15), %xmm0
00000000001dba4d	movups	%xmm0, 0x30(%r14)
00000000001dba52	movq	0x78(%r15), %rcx
00000000001dba56	movq	%rcx, 0x58(%r14)
00000000001dba5a	movups	0x68(%r15), %xmm0
00000000001dba5f	movups	%xmm0, 0x48(%r14)
00000000001dba64	movq	0x90(%r15), %rcx
00000000001dba6b	movq	%rcx, 0x70(%r14)
00000000001dba6f	movups	0x80(%r15), %xmm0
00000000001dba77	movups	%xmm0, 0x60(%r14)
00000000001dba7c	movq	0xa8(%r15), %rcx
00000000001dba83	movq	%rcx, 0x88(%r14)
00000000001dba8a	movups	0x98(%r15), %xmm0
00000000001dba92	movups	%xmm0, 0x78(%r14)
00000000001dba97	movq	-0x48(%rbp), %rdi
00000000001dba9b	movq	0x10(%rdi), %rcx
00000000001dba9f	movq	%rcx, 0xa0(%r14)
00000000001dbaa6	movups	(%rdi), %xmm0
00000000001dbaa9	movups	%xmm0, 0x90(%r14)
00000000001dbab1	movq	0xc0(%r15), %rcx
00000000001dbab8	movq	%rcx, 0xb8(%r14)
00000000001dbabf	movups	0xb0(%r15), %xmm0
00000000001dbac7	movups	%xmm0, 0xa8(%r14)
00000000001dbacf	movq	0x10(%rax), %rcx
00000000001dbad3	movq	%rcx, -0x220(%rbp)
00000000001dbada	movups	(%rax), %xmm0
00000000001dbadd	movaps	%xmm0, -0x230(%rbp)
00000000001dbae4	cmpq	%rdx, %rax
00000000001dbae7	je	0x1dbb09
00000000001dbae9	movsd	-0x8(%rsi,%r12), %xmm0
00000000001dbaf0	movsd	%xmm0, -0x218(%rbp)
00000000001dbaf8	movq	0x10(%rsi,%r12), %rcx
00000000001dbafd	movq	%rcx, 0x10(%rbx)
00000000001dbb01	movups	(%rsi,%r12), %xmm0
00000000001dbb06	movups	%xmm0, (%rbx)
00000000001dbb09	movq	0x48(%rax), %rcx
00000000001dbb0d	movq	%rcx, 0x28(%rbx)
00000000001dbb11	movups	0x38(%rax), %xmm0
00000000001dbb15	movups	%xmm0, 0x18(%rbx)
00000000001dbb19	movq	0x60(%rax), %rcx
00000000001dbb1d	movq	%rcx, 0x40(%rbx)
00000000001dbb21	movups	0x50(%rax), %xmm0
00000000001dbb25	movups	%xmm0, 0x30(%rbx)
00000000001dbb29	movq	0x78(%rax), %rcx
00000000001dbb2d	movq	%rcx, 0x58(%rbx)
00000000001dbb31	movups	0x68(%rax), %xmm0
00000000001dbb35	movups	%xmm0, 0x48(%rbx)
00000000001dbb39	movq	0x90(%rax), %rcx
00000000001dbb40	movq	%rcx, 0x70(%rbx)
00000000001dbb44	movups	0x80(%rax), %xmm0
00000000001dbb4b	movups	%xmm0, 0x60(%rbx)
00000000001dbb4f	movq	0xa8(%rax), %rcx
00000000001dbb56	movq	%rcx, 0x88(%rbx)
00000000001dbb5d	movups	0x98(%rax), %xmm0
00000000001dbb64	movups	%xmm0, 0x78(%rbx)
00000000001dbb68	movq	-0x58(%rbp), %rsi
00000000001dbb6c	movq	0x10(%rsi), %rcx
00000000001dbb70	movq	%rcx, 0xa0(%rbx)
00000000001dbb77	movups	(%rsi), %xmm0
00000000001dbb7a	movups	%xmm0, 0x90(%rbx)
00000000001dbb81	movq	0xc0(%rax), %rcx
00000000001dbb88	movq	%rcx, 0xb8(%rbx)
00000000001dbb8f	movups	0xb0(%rax), %xmm0
00000000001dbb96	movups	%xmm0, 0xa8(%rbx)
00000000001dbb9d	movq	-0x60(%rbp), %rdi
00000000001dbba1	movq	(%rdi), %rax
00000000001dbba4	movzbl	-0x2c(%rbp), %r8d
00000000001dbba9	movq	-0x68(%rbp), %rsi
00000000001dbbad	movq	%r13, %rcx
00000000001dbbb0	movq	-0x70(%rbp), %r9
00000000001dbbb4	callq	*0x2e0(%rax)
00000000001dbbba	movq	-0x140(%rbp), %rax
00000000001dbbc1	movq	%rax, 0x10(%r15)
00000000001dbbc5	movaps	-0x150(%rbp), %xmm0
00000000001dbbcc	movups	%xmm0, (%r15)
00000000001dbbd0	cmpq	%r13, %r15
00000000001dbbd3	movq	-0x40(%rbp), %rdi
00000000001dbbd7	je	0x1db8f0
00000000001dbbdd	movsd	-0x138(%rbp), %xmm0
00000000001dbbe5	movsd	%xmm0, -0x8(%rdi,%r12)
00000000001dbbec	movups	(%r14), %xmm0
00000000001dbbf0	movups	%xmm0, (%rdi,%r12)
00000000001dbbf5	movq	0x10(%r14), %rax
00000000001dbbf9	movq	%rax, 0x10(%rdi,%r12)
00000000001dbbfe	jmp	0x1db8f0
00000000001dbc03	addq	$0x208, %rsp                    ## imm = 0x208
00000000001dbc0a	popq	%rbx
00000000001dbc0b	popq	%r12
00000000001dbc0d	popq	%r13
00000000001dbc0f	popq	%r14
00000000001dbc11	popq	%r15
00000000001dbc13	popq	%rbp
00000000001dbc14	retq
00000000001dbc15	nopw	%cs:(%rax,%rax)
