__ZN23OZChannelObjectRootBase12parseElementER22PCSerializerReadStreamR15PCStreamElement:
0000000000072de6	pushq	%rbp
0000000000072de7	movq	%rsp, %rbp
0000000000072dea	pushq	%r15
0000000000072dec	pushq	%r14
0000000000072dee	pushq	%r13
0000000000072df0	pushq	%r12
0000000000072df2	pushq	%rbx
0000000000072df3	subq	$0xb8, %rsp
0000000000072dfa	movq	%rdx, %r14
0000000000072dfd	movq	%rsi, %r15
0000000000072e00	movq	%rdi, %rbx
0000000000072e03	callq	__ZN15OZChannelFolder12parseElementER22PCSerializerReadStreamR15PCStreamElement ## OZChannelFolder::parseElement(PCSerializerReadStream&, PCStreamElement&)
0000000000072e08	movl	$0xffffff6a, %eax               ## imm = 0xFFFFFF6A
0000000000072e0d	addl	0x8(%r14), %eax
0000000000072e11	cmpl	$0x4, %eax
0000000000072e14	ja	0x73256
0000000000072e1a	leaq	0x44b(%rip), %rcx
0000000000072e21	movslq	(%rcx,%rax,4), %rax
0000000000072e25	addq	%rcx, %rax
0000000000072e28	jmpq	*%rax
0000000000072e2a	cmpl	$0x5, 0x68(%r15)
0000000000072e2f	movq	(%r14), %rax
0000000000072e32	jb	0x72fe9
0000000000072e38	leaq	-0x60(%rbp), %rdx
0000000000072e3c	movq	%r14, %rdi
0000000000072e3f	movl	$0x1, %esi
0000000000072e44	callq	*0xa8(%rax)
0000000000072e4a	testb	%al, %al
0000000000072e4c	je	0x72e64
0000000000072e4e	movq	-0x50(%rbp), %rax
0000000000072e52	movq	%rax, 0xa8(%rbx)
0000000000072e59	movups	-0x60(%rbp), %xmm0
0000000000072e5d	movups	%xmm0, 0x98(%rbx)
0000000000072e64	movq	(%r14), %rax
0000000000072e67	leaq	-0x60(%rbp), %rdx
0000000000072e6b	movq	%r14, %rdi
0000000000072e6e	movl	$0x2, %esi
0000000000072e73	callq	*0xa8(%rax)
0000000000072e79	testb	%al, %al
0000000000072e7b	je	0x73227
0000000000072e81	leaq	0x98(%rbx), %r13
0000000000072e88	cmpb	$0x1, 0x90(%r15)
0000000000072e90	jne	0x73189
0000000000072e96	movq	0x80(%r15), %rax
0000000000072e9d	movq	%rax, -0x30(%rbp)
0000000000072ea1	movups	0x70(%r15), %xmm0
0000000000072ea6	movaps	%xmm0, -0x40(%rbp)
0000000000072eaa	movq	0x10(%r13), %rax
0000000000072eae	leaq	-0x80(%rbp), %r15
0000000000072eb2	movq	%rax, 0x10(%r15)
0000000000072eb6	movups	(%r13), %xmm0
0000000000072ebb	movaps	%xmm0, (%r15)
0000000000072ebf	movq	0x10(%r15), %rax
0000000000072ec3	movq	%rax, 0x28(%rsp)
0000000000072ec8	movaps	(%r15), %xmm0
0000000000072ecc	movups	%xmm0, 0x18(%rsp)
0000000000072ed1	movq	-0x50(%rbp), %rax
0000000000072ed5	movq	%rax, 0x10(%rsp)
0000000000072eda	movups	-0x60(%rbp), %xmm0
0000000000072ede	movups	%xmm0, (%rsp)
0000000000072ee2	leaq	-0x98(%rbp), %r12
0000000000072ee9	movq	%r12, %rdi
0000000000072eec	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
0000000000072ef1	movq	-0x30(%rbp), %rax
0000000000072ef5	movq	%rax, 0x28(%rsp)
0000000000072efa	movaps	-0x40(%rbp), %xmm0
0000000000072efe	movups	%xmm0, 0x18(%rsp)
0000000000072f03	movq	0x10(%r12), %rax
0000000000072f08	movq	%rax, 0x10(%rsp)
0000000000072f0d	movups	(%r12), %xmm0
0000000000072f12	jmp	0x73205
0000000000072f17	movq	(%r14), %rax
0000000000072f1a	leaq	-0x40(%rbp), %rsi
0000000000072f1e	movq	%r14, %rdi
0000000000072f21	callq	*0x48(%rax)
0000000000072f24	testb	%al, %al
0000000000072f26	je	0x73256
0000000000072f2c	movb	-0x40(%rbp), %al
0000000000072f2f	movb	%al, 0xc8(%rbx)
0000000000072f35	jmp	0x73256
0000000000072f3a	movq	(%r14), %rax
0000000000072f3d	leaq	-0x40(%rbp), %rsi
0000000000072f41	movq	%r14, %rdi
0000000000072f44	callq	*0x20(%rax)
0000000000072f47	testb	%al, %al
0000000000072f49	je	0x73256
0000000000072f4f	movl	$0x8000, %esi                   ## imm = 0x8000
0000000000072f54	movq	%rbx, %rdi
0000000000072f57	callq	__ZNK13OZChannelBase8testFlagEy ## OZChannelBase::testFlag(unsigned long long) const
0000000000072f5c	movl	$0xffff7fff, %ecx               ## imm = 0xFFFF7FFF
0000000000072f61	andl	-0x40(%rbp), %ecx
0000000000072f64	movzbl	%al, %eax
0000000000072f67	shll	$0xf, %eax
0000000000072f6a	orl	%ecx, %eax
0000000000072f6c	movl	%eax, -0x40(%rbp)
0000000000072f6f	movl	$0x4, %esi
0000000000072f74	movq	%rbx, %rdi
0000000000072f77	callq	__ZNK13OZChannelBase8testFlagEy ## OZChannelBase::testFlag(unsigned long long) const
0000000000072f7c	movl	$0xffffcffb, %ecx               ## imm = 0xFFFFCFFB
0000000000072f81	andl	-0x40(%rbp), %ecx
0000000000072f84	movzbl	%al, %eax
0000000000072f87	leal	(%rcx,%rax,4), %esi
0000000000072f8a	addl	$0x3000, %esi                   ## imm = 0x3000
0000000000072f90	movl	%esi, -0x40(%rbp)
0000000000072f93	movq	%rbx, %rdi
0000000000072f96	callq	__ZN13OZChannelBase8setFlagsEy  ## OZChannelBase::setFlags(unsigned long long)
0000000000072f9b	jmp	0x73256
0000000000072fa0	movq	(%r14), %rax
0000000000072fa3	leaq	-0x40(%rbp), %rsi
0000000000072fa7	movq	%r14, %rdi
0000000000072faa	callq	*0x48(%rax)
0000000000072fad	testb	%al, %al
0000000000072faf	je	0x73256
0000000000072fb5	movzbl	-0x40(%rbp), %esi
0000000000072fb9	movq	(%rbx), %rax
0000000000072fbc	movq	%rbx, %rdi
0000000000072fbf	xorl	%edx, %edx
0000000000072fc1	callq	*0x68(%rax)
0000000000072fc4	jmp	0x73256
0000000000072fc9	movq	(%r14), %rax
0000000000072fcc	leaq	-0x40(%rbp), %rsi
0000000000072fd0	movq	%r14, %rdi
0000000000072fd3	callq	*0x20(%rax)
0000000000072fd6	testb	%al, %al
0000000000072fd8	je	0x73256
0000000000072fde	movl	-0x40(%rbp), %eax
0000000000072fe1	movl	%eax, 0x78(%rbx)
0000000000072fe4	jmp	0x73256
0000000000072fe9	leaq	-0x48(%rbp), %rdx
0000000000072fed	movq	%r14, %rdi
0000000000072ff0	movl	$0x1, %esi
0000000000072ff5	callq	*0x90(%rax)
0000000000072ffb	testb	%al, %al
0000000000072ffd	je	0x7303f
0000000000072fff	movq	0x80(%r15), %rax
0000000000073006	leaq	-0x80(%rbp), %rsi
000000000007300a	movq	%rax, 0x10(%rsi)
000000000007300e	movups	0x70(%r15), %xmm0
0000000000073013	movaps	%xmm0, (%rsi)
0000000000073016	movsd	-0x48(%rbp), %xmm0
000000000007301b	leaq	-0x40(%rbp), %r12
000000000007301f	movq	%r12, %rdi
0000000000073022	callq	0xace28                         ## symbol stub for: __ZmlRK6CMTimed
0000000000073027	movq	0x10(%r12), %rax
000000000007302c	movq	%rax, 0xa8(%rbx)
0000000000073033	movups	(%r12), %xmm0
0000000000073038	movups	%xmm0, 0x98(%rbx)
000000000007303f	movq	(%r14), %rax
0000000000073042	leaq	-0x48(%rbp), %rdx
0000000000073046	movq	%r14, %rdi
0000000000073049	movl	$0x2, %esi
000000000007304e	callq	*0x90(%rax)
0000000000073054	testb	%al, %al
0000000000073056	je	0x73130
000000000007305c	movq	0x80(%r15), %rax
0000000000073063	leaq	-0xb0(%rbp), %rsi
000000000007306a	movq	%rax, 0x10(%rsi)
000000000007306e	movups	0x70(%r15), %xmm0
0000000000073073	movaps	%xmm0, (%rsi)
0000000000073076	movsd	-0x48(%rbp), %xmm0
000000000007307b	leaq	-0x60(%rbp), %r13
000000000007307f	movq	%r13, %rdi
0000000000073082	callq	0xace28                         ## symbol stub for: __ZmlRK6CMTimed
0000000000073087	movq	0x80(%r15), %rax
000000000007308e	movq	%rax, -0x30(%rbp)
0000000000073092	movups	0x70(%r15), %xmm0
0000000000073097	movaps	%xmm0, -0x40(%rbp)
000000000007309b	movq	0xa8(%rbx), %rax
00000000000730a2	leaq	-0x80(%rbp), %r12
00000000000730a6	movq	%rax, 0x10(%r12)
00000000000730ab	movups	0x98(%rbx), %xmm0
00000000000730b2	movaps	%xmm0, (%r12)
00000000000730b7	movq	0x10(%r12), %rax
00000000000730bc	movq	%rax, 0x28(%rsp)
00000000000730c1	movaps	(%r12), %xmm0
00000000000730c6	movups	%xmm0, 0x18(%rsp)
00000000000730cb	movq	0x10(%r13), %rax
00000000000730cf	movq	%rax, 0x10(%rsp)
00000000000730d4	movups	(%r13), %xmm0
00000000000730d9	movups	%xmm0, (%rsp)
00000000000730dd	leaq	-0x98(%rbp), %r13
00000000000730e4	movq	%r13, %rdi
00000000000730e7	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000730ec	movq	-0x30(%rbp), %rax
00000000000730f0	movq	%rax, 0x28(%rsp)
00000000000730f5	movaps	-0x40(%rbp), %xmm0
00000000000730f9	movups	%xmm0, 0x18(%rsp)
00000000000730fe	movq	0x10(%r13), %rax
0000000000073102	movq	%rax, 0x10(%rsp)
0000000000073107	movups	(%r13), %xmm0
000000000007310c	movups	%xmm0, (%rsp)
0000000000073110	movq	%r12, %rdi
0000000000073113	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
0000000000073118	movq	0x10(%r12), %rax
000000000007311d	movq	%rax, 0xc0(%rbx)
0000000000073124	movups	(%r12), %xmm0
0000000000073129	movups	%xmm0, 0xb0(%rbx)
0000000000073130	movq	(%r14), %rax
0000000000073133	leaq	-0x48(%rbp), %rdx
0000000000073137	movq	%r14, %rdi
000000000007313a	movl	$0x3, %esi
000000000007313f	callq	*0x90(%rax)
0000000000073145	testb	%al, %al
0000000000073147	je	0x73256
000000000007314d	movq	0x80(%r15), %rax
0000000000073154	leaq	-0x80(%rbp), %rsi
0000000000073158	movq	%rax, 0x10(%rsi)
000000000007315c	movups	0x70(%r15), %xmm0
0000000000073161	movaps	%xmm0, (%rsi)
0000000000073164	movsd	-0x48(%rbp), %xmm0
0000000000073169	leaq	-0x40(%rbp), %r14
000000000007316d	movq	%r14, %rdi
0000000000073170	callq	0xace28                         ## symbol stub for: __ZmlRK6CMTimed
0000000000073175	movq	0x10(%r14), %rax
0000000000073179	movq	%rax, 0x90(%rbx)
0000000000073180	movups	(%r14), %xmm0
0000000000073184	jmp	0x7324f
0000000000073189	movq	(%rbx), %rax
000000000007318c	leaq	-0x98(%rbp), %r12
0000000000073193	movq	%r12, %rdi
0000000000073196	movq	%rbx, %rsi
0000000000073199	callq	*0x378(%rax)
000000000007319f	movq	0x10(%r13), %rax
00000000000731a3	leaq	-0x40(%rbp), %r15
00000000000731a7	movq	%rax, 0x10(%r15)
00000000000731ab	movups	(%r13), %xmm0
00000000000731b0	movaps	%xmm0, (%r15)
00000000000731b4	movq	0x10(%r15), %rax
00000000000731b8	movq	%rax, 0x28(%rsp)
00000000000731bd	movaps	(%r15), %xmm0
00000000000731c1	movups	%xmm0, 0x18(%rsp)
00000000000731c6	movq	-0x50(%rbp), %rax
00000000000731ca	movq	%rax, 0x10(%rsp)
00000000000731cf	movups	-0x60(%rbp), %xmm0
00000000000731d3	movups	%xmm0, (%rsp)
00000000000731d7	leaq	-0x80(%rbp), %r13
00000000000731db	movq	%r13, %rdi
00000000000731de	callq	0xacada                         ## symbol stub for: _PC_CMTimeSaferSubtract
00000000000731e3	movq	0x10(%r12), %rax
00000000000731e8	movq	%rax, 0x28(%rsp)
00000000000731ed	movups	(%r12), %xmm0
00000000000731f2	movups	%xmm0, 0x18(%rsp)
00000000000731f7	movq	0x10(%r13), %rax
00000000000731fb	movq	%rax, 0x10(%rsp)
0000000000073200	movups	(%r13), %xmm0
0000000000073205	movups	%xmm0, (%rsp)
0000000000073209	movq	%r15, %rdi
000000000007320c	callq	0xacad4                         ## symbol stub for: _PC_CMTimeSaferAdd
0000000000073211	movq	0x10(%r15), %rax
0000000000073215	movq	%rax, 0xc0(%rbx)
000000000007321c	movups	(%r15), %xmm0
0000000000073220	movups	%xmm0, 0xb0(%rbx)
0000000000073227	movq	(%r14), %rax
000000000007322a	leaq	-0x60(%rbp), %rdx
000000000007322e	movq	%r14, %rdi
0000000000073231	movl	$0x3, %esi
0000000000073236	callq	*0xa8(%rax)
000000000007323c	testb	%al, %al
000000000007323e	je	0x73256
0000000000073240	movq	-0x50(%rbp), %rax
0000000000073244	movq	%rax, 0x90(%rbx)
000000000007324b	movups	-0x60(%rbp), %xmm0
000000000007324f	movups	%xmm0, 0x80(%rbx)
0000000000073256	movb	$0x1, %al
0000000000073258	addq	$0xb8, %rsp
000000000007325f	popq	%rbx
0000000000073260	popq	%r12
0000000000073262	popq	%r13
0000000000073264	popq	%r14
0000000000073266	popq	%r15
0000000000073268	popq	%rbp
0000000000073269	retq
000000000007326a	nop
000000000007326c	movl	$0x5dfffffb, %esi               ## imm = 0x5DFFFFFB
0000000000073271	std
0000000000073272	.byte 0xff #bad opcode
0000000000073273	decl	%esi
0000000000073275	cld
0000000000073276	.byte 0xff #bad opcode
0000000000073277	pushq	-0x3540001(,%rdi,8)
000000000007327e	.byte 0xff #bad opcode
000000000007327f	callq	*0x48(%rbp)
0000000000073282	movl	%esp, %ebp
0000000000073284	addq	$-0x10, %rdi
0000000000073288	callq	__ZN23OZChannelObjectRootBase12parseElementER22PCSerializerReadStreamR15PCStreamElement ## OZChannelObjectRootBase::parseElement(PCSerializerReadStream&, PCStreamElement&)
000000000007328d	movb	$0x1, %al
000000000007328f	popq	%rbp
0000000000073290	retq
0000000000073291	nop
