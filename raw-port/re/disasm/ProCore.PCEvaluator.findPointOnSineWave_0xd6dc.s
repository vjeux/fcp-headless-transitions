000000000000d6dc	pushq	%rbp
000000000000d6dd	movq	%rsp, %rbp
000000000000d6e0	pushq	%r15
000000000000d6e2	pushq	%r14
000000000000d6e4	pushq	%r13
000000000000d6e6	pushq	%r12
000000000000d6e8	pushq	%rbx
000000000000d6e9	subq	$0x138, %rsp                    ## imm = 0x138
000000000000d6f0	movq	%rcx, %r12
000000000000d6f3	movq	%rdx, %r13
000000000000d6f6	movsd	%xmm0, -0x48(%rbp)
000000000000d6fb	movq	%rdi, %r14
000000000000d6fe	movl	$0x0, -0xe8(%rbp)
000000000000d708	movsd	%xmm5, -0x140(%rbp)
000000000000d710	movsd	%xmm6, -0x138(%rbp)
000000000000d718	movsd	%xmm1, -0x130(%rbp)
000000000000d720	movsd	%xmm2, -0x128(%rbp)
000000000000d728	movsd	%xmm3, -0x120(%rbp)
000000000000d730	movapd	%xmm4, -0xe0(%rbp)
000000000000d738	movsd	%xmm4, -0x118(%rbp)
000000000000d740	movl	%esi, -0x110(%rbp)
000000000000d746	xorpd	%xmm0, %xmm0
000000000000d74a	movupd	%xmm0, -0x108(%rbp)
000000000000d752	movupd	%xmm0, -0xf8(%rbp)
000000000000d75a	leaq	0x58(%rdi), %rbx
000000000000d75e	movq	%rbx, %rdi
000000000000d761	callq	__ZN10PCSpinLock4lockEv         ## PCSpinLock::lock()
000000000000d766	leaq	-0x140(%rbp), %rsi
000000000000d76d	movq	%r14, %rdi
000000000000d770	callq	__ZN19PCEvaluatorWaveDataeqERKS_ ## PCEvaluatorWaveData::operator==(PCEvaluatorWaveData const&)
000000000000d775	testb	%al, %al
000000000000d777	jne	0xd790
000000000000d779	leaq	-0x140(%rbp), %rsi
000000000000d780	movq	%r14, %rdi
000000000000d783	callq	__ZN19PCEvaluatorWaveDataaSERKS_ ## PCEvaluatorWaveData::operator=(PCEvaluatorWaveData const&)
000000000000d788	movq	%r14, %rdi
000000000000d78b	callq	__ZN19PCEvaluatorWaveData17refreshWaveArraysEv ## PCEvaluatorWaveData::refreshWaveArrays()
000000000000d790	movsd	(%r14), %xmm0
000000000000d795	movsd	%xmm0, -0x40(%rbp)
000000000000d79a	movsd	0x8(%r14), %xmm0
000000000000d7a0	movsd	%xmm0, -0x50(%rbp)
000000000000d7a5	leaq	-0x2c(%rbp), %rdx
000000000000d7a9	movl	$0x0, (%rdx)
000000000000d7af	movq	0x50(%r14), %rdi
000000000000d7b3	movslq	0x30(%r14), %rsi
000000000000d7b7	movsd	-0x48(%rbp), %xmm0
000000000000d7bc	mulsd	-0x8(%rdi,%rsi,8), %xmm0
000000000000d7c2	movsd	%xmm0, -0x48(%rbp)
000000000000d7c7	callq	__ZN11PCAlgorithm6bisectEPdjdPi ## PCAlgorithm::bisect(double*, unsigned int, double, int*)
000000000000d7cc	movq	0x50(%r14), %rax
000000000000d7d0	movslq	-0x2c(%rbp), %r15
000000000000d7d4	movsd	(%rax,%r15,8), %xmm1
000000000000d7da	movsd	0x8(%rax,%r15,8), %xmm0
000000000000d7e1	movsd	%xmm1, -0x60(%rbp)
000000000000d7e6	subsd	%xmm1, %xmm0
000000000000d7ea	movapd	%xmm0, %xmm1
000000000000d7ee	addsd	%xmm0, %xmm1
000000000000d7f2	roundsd	$0xa, %xmm1, %xmm1
000000000000d7f8	movsd	0x114d30(%rip), %xmm2
000000000000d800	ucomisd	%xmm1, %xmm2
000000000000d804	jae	0xdacc
000000000000d80a	movq	%r13, -0xa8(%rbp)
000000000000d811	movq	%rbx, -0xb0(%rbp)
000000000000d818	cvttsd2si	%xmm1, %rcx
000000000000d81d	movq	%r14, -0x80(%rbp)
000000000000d821	xorps	%xmm0, %xmm0
000000000000d824	cvtsi2sdl	0x30(%r14), %xmm0
000000000000d82a	movsd	%xmm0, -0x68(%rbp)
000000000000d82f	leal	0x1(%rcx), %eax
000000000000d832	movl	%eax, -0x70(%rbp)
000000000000d835	cltq
000000000000d837	shlq	$0x3, %rax
000000000000d83b	movq	%rcx, -0x78(%rbp)
000000000000d83f	cmpl	$-0x1, %ecx
000000000000d842	movq	$-0x1, %r14
000000000000d849	cmovgeq	%rax, %r14
000000000000d84d	movq	%r14, %rdi
000000000000d850	callq	0xde6c6                         ## symbol stub for: __Znam
000000000000d855	movq	%rax, %r13
000000000000d858	movq	%r14, %rdi
000000000000d85b	callq	0xde6c6                         ## symbol stub for: __Znam
000000000000d860	movq	%rax, %rbx
000000000000d863	movq	%r14, %rdi
000000000000d866	callq	0xde6c6                         ## symbol stub for: __Znam
000000000000d86b	movq	%rax, -0x58(%rbp)
000000000000d86f	movq	%r14, %rdi
000000000000d872	callq	0xde6c6                         ## symbol stub for: __Znam
000000000000d877	movq	%rax, %r14
000000000000d87a	movq	-0x80(%rbp), %rcx
000000000000d87e	movq	0x38(%rcx), %rax
000000000000d882	movsd	(%rax,%r15,8), %xmm2
000000000000d888	movsd	%xmm2, (%r13)
000000000000d88e	movq	0x40(%rcx), %rax
000000000000d892	movsd	(%rax,%r15,8), %xmm0
000000000000d898	movsd	%xmm0, (%rbx)
000000000000d89c	movq	0x48(%rcx), %rax
000000000000d8a0	movsd	(%rax,%r15,8), %xmm3
000000000000d8a6	movq	-0x58(%rbp), %r15
000000000000d8aa	movsd	%xmm3, (%r15)
000000000000d8af	movq	-0x78(%rbp), %rax
000000000000d8b3	testl	%eax, %eax
000000000000d8b5	jle	0xdb3c
000000000000d8bb	movsd	%xmm0, -0x90(%rbp)
000000000000d8c3	movq	%r14, -0x98(%rbp)
000000000000d8ca	movq	%r12, -0xa0(%rbp)
000000000000d8d1	movsd	-0x40(%rbp), %xmm0
000000000000d8d6	mulsd	%xmm0, %xmm0
000000000000d8da	movsd	-0x50(%rbp), %xmm1
000000000000d8df	mulsd	%xmm1, %xmm1
000000000000d8e3	addsd	%xmm0, %xmm1
000000000000d8e7	sqrtsd	%xmm1, %xmm1
000000000000d8eb	movsd	0x114c3d(%rip), %xmm4
000000000000d8f3	divsd	-0x68(%rbp), %xmm4
000000000000d8f8	xorps	%xmm0, %xmm0
000000000000d8fb	cvtsi2sd	%eax, %xmm0
000000000000d8ff	divsd	%xmm0, %xmm4
000000000000d903	movsd	%xmm4, -0xd0(%rbp)
000000000000d90b	mulsd	%xmm4, %xmm1
000000000000d90f	movsd	%xmm1, -0x68(%rbp)
000000000000d914	movapd	0xd4754(%rip), %xmm0
000000000000d91c	movapd	-0xe0(%rbp), %xmm1
000000000000d924	orpd	%xmm1, %xmm0
000000000000d928	movapd	%xmm0, -0x160(%rbp)
000000000000d930	movsd	0x10(%rcx), %xmm0
000000000000d935	movsd	%xmm0, -0xc8(%rbp)
000000000000d93d	movsd	0x18(%rcx), %xmm0
000000000000d942	movsd	%xmm0, -0xc0(%rbp)
000000000000d94a	movsd	0x20(%rcx), %xmm0
000000000000d94f	movsd	%xmm0, -0xb8(%rbp)
000000000000d957	movq	%r15, %r14
000000000000d95a	movl	-0x70(%rbp), %r15d
000000000000d95e	movl	$0x1, %r12d
000000000000d964	xorpd	%xmm0, %xmm0
000000000000d968	cmpltsd	%xmm0, %xmm1
000000000000d96d	movapd	%xmm1, -0x150(%rbp)
000000000000d975	movsd	%xmm2, -0x88(%rbp)
000000000000d97d	addsd	-0x68(%rbp), %xmm2
000000000000d982	movsd	%xmm2, -0x50(%rbp)
000000000000d987	addsd	-0xd0(%rbp), %xmm3
000000000000d98f	movapd	%xmm3, -0x40(%rbp)
000000000000d994	movsd	%xmm3, (%r14,%r12,8)
000000000000d99a	movsd	%xmm2, (%r13,%r12,8)
000000000000d9a1	movsd	0x114b87(%rip), %xmm2
000000000000d9a9	subsd	%xmm3, %xmm2
000000000000d9ad	movapd	%xmm3, %xmm1
000000000000d9b1	movaps	-0x150(%rbp), %xmm0
000000000000d9b8	blendvpd	%xmm0, %xmm2, %xmm1
000000000000d9bd	mulsd	-0x160(%rbp), %xmm1
000000000000d9c5	movapd	%xmm1, %xmm0
000000000000d9c9	callq	0xde858                         ## symbol stub for: _exp
000000000000d9ce	mulsd	-0xc8(%rbp), %xmm0
000000000000d9d6	movsd	%xmm0, -0x70(%rbp)
000000000000d9db	movapd	-0x40(%rbp), %xmm0
000000000000d9e0	mulsd	0x114b78(%rip), %xmm0
000000000000d9e8	mulsd	-0xc0(%rbp), %xmm0
000000000000d9f0	addsd	-0xb8(%rbp), %xmm0
000000000000d9f8	callq	0xdeb2e                         ## symbol stub for: _sin
000000000000d9fd	movapd	-0x40(%rbp), %xmm3
000000000000da02	mulsd	-0x70(%rbp), %xmm0
000000000000da07	movsd	%xmm0, (%rbx,%r12,8)
000000000000da0d	movsd	-0x50(%rbp), %xmm2
000000000000da12	incq	%r12
000000000000da15	cmpq	%r12, %r15
000000000000da18	jne	0xd97d
000000000000da1e	movq	-0x98(%rbp), %r14
000000000000da25	movsd	-0x60(%rbp), %xmm4
000000000000da2a	movsd	%xmm4, (%r14)
000000000000da2f	movl	$0x1, %eax
000000000000da34	movsd	-0x90(%rbp), %xmm5
000000000000da3c	movsd	-0x88(%rbp), %xmm2
000000000000da44	movsd	(%r13,%rax,8), %xmm0
000000000000da4b	movapd	%xmm0, %xmm1
000000000000da4f	subsd	%xmm2, %xmm1
000000000000da53	mulsd	%xmm1, %xmm1
000000000000da57	movsd	(%rbx,%rax,8), %xmm2
000000000000da5c	movapd	%xmm2, %xmm3
000000000000da60	subsd	%xmm5, %xmm3
000000000000da64	mulsd	%xmm3, %xmm3
000000000000da68	addsd	%xmm1, %xmm3
000000000000da6c	xorps	%xmm1, %xmm1
000000000000da6f	sqrtsd	%xmm3, %xmm1
000000000000da73	addsd	%xmm1, %xmm4
000000000000da77	movsd	%xmm4, (%r14,%rax,8)
000000000000da7d	incq	%rax
000000000000da80	movapd	%xmm2, %xmm5
000000000000da84	movapd	%xmm0, %xmm2
000000000000da88	cmpq	%rax, %r15
000000000000da8b	jne	0xda44
000000000000da8d	decq	%r15
000000000000da90	xorl	%eax, %eax
000000000000da92	movq	-0xa0(%rbp), %r12
000000000000da99	movsd	-0x48(%rbp), %xmm1
000000000000da9e	movsd	0x8(%r14,%rax,8), %xmm0
000000000000daa5	ucomisd	%xmm1, %xmm0
000000000000daa9	ja	0xdc39
000000000000daaf	incq	%rax
000000000000dab2	cmpq	%rax, %r15
000000000000dab5	jne	0xda9e
000000000000dab7	movq	-0x78(%rbp), %rcx
000000000000dabb	movl	%ecx, %eax
000000000000dabd	movq	-0x58(%rbp), %r15
000000000000dac1	movsd	(%r15,%rax,8), %xmm3
000000000000dac7	movq	%rcx, %rax
000000000000daca	jmp	0xdb48
000000000000dacc	movl	0x30(%r14), %eax
000000000000dad0	decl	%eax
000000000000dad2	cmpl	%eax, %r15d
000000000000dad5	jge	0xdb30
000000000000dad7	movapd	0x114b91(%rip), %xmm2
000000000000dadf	andpd	%xmm0, %xmm2
000000000000dae3	movsd	0x114d95(%rip), %xmm1
000000000000daeb	ucomisd	%xmm2, %xmm1
000000000000daef	movq	0x48(%r14), %rax
000000000000daf3	ja	0xdb34
000000000000daf5	movsd	(%rax,%r15,8), %xmm4
000000000000dafb	movsd	0x8(%rax,%r15,8), %xmm2
000000000000db02	subsd	%xmm4, %xmm2
000000000000db06	movapd	0x114b62(%rip), %xmm3
000000000000db0e	andpd	%xmm2, %xmm3
000000000000db12	ucomisd	%xmm3, %xmm1
000000000000db16	ja	0xdb87
000000000000db18	movsd	-0x48(%rbp), %xmm1
000000000000db1d	subsd	-0x60(%rbp), %xmm1
000000000000db22	divsd	%xmm2, %xmm0
000000000000db26	divsd	%xmm0, %xmm1
000000000000db2a	addsd	%xmm1, %xmm4
000000000000db2e	jmp	0xdb87
000000000000db30	movq	0x48(%r14), %rax
000000000000db34	movsd	(%rax,%r15,8), %xmm4
000000000000db3a	jmp	0xdb87
000000000000db3c	movsd	-0x60(%rbp), %xmm0
000000000000db41	movsd	%xmm0, (%r14)
000000000000db46	xorl	%eax, %eax
000000000000db48	movapd	%xmm3, -0x40(%rbp)
000000000000db4d	movl	%eax, -0x2c(%rbp)
000000000000db50	movq	%r13, %rdi
000000000000db53	callq	0xde6ba                         ## symbol stub for: __ZdaPv
000000000000db58	movq	%rbx, %rdi
000000000000db5b	callq	0xde6ba                         ## symbol stub for: __ZdaPv
000000000000db60	movq	%r15, %rdi
000000000000db63	callq	0xde6ba                         ## symbol stub for: __ZdaPv
000000000000db68	movq	%r14, %rdi
000000000000db6b	callq	0xde6ba                         ## symbol stub for: __ZdaPv
000000000000db70	movq	-0xb0(%rbp), %rbx
000000000000db77	movq	-0x80(%rbp), %r14
000000000000db7b	movq	-0xa8(%rbp), %r13
000000000000db82	movapd	-0x40(%rbp), %xmm4
000000000000db87	movapd	%xmm4, -0x40(%rbp)
000000000000db8c	movapd	0xd44dc(%rip), %xmm2
000000000000db94	movapd	-0xe0(%rbp), %xmm0
000000000000db9c	orpd	%xmm0, %xmm2
000000000000dba0	movsd	0x114988(%rip), %xmm3
000000000000dba8	subsd	%xmm4, %xmm3
000000000000dbac	xorpd	%xmm1, %xmm1
000000000000dbb0	cmpltsd	%xmm1, %xmm0
000000000000dbb5	movapd	%xmm4, %xmm1
000000000000dbb9	blendvpd	%xmm0, %xmm3, %xmm1
000000000000dbbe	mulsd	%xmm2, %xmm1
000000000000dbc2	movapd	%xmm1, %xmm0
000000000000dbc6	callq	0xde858                         ## symbol stub for: _exp
000000000000dbcb	movapd	-0x40(%rbp), %xmm1
000000000000dbd0	testq	%r13, %r13
000000000000dbd3	je	0xdbdb
000000000000dbd5	movsd	%xmm1, (%r13)
000000000000dbdb	testq	%r12, %r12
000000000000dbde	je	0xdc13
000000000000dbe0	mulsd	0x10(%r14), %xmm0
000000000000dbe6	movsd	%xmm0, -0x50(%rbp)
000000000000dbeb	mulsd	0x11496d(%rip), %xmm1
000000000000dbf3	mulsd	0x18(%r14), %xmm1
000000000000dbf9	addsd	0x20(%r14), %xmm1
000000000000dbff	movapd	%xmm1, %xmm0
000000000000dc03	callq	0xdeb2e                         ## symbol stub for: _sin
000000000000dc08	mulsd	-0x50(%rbp), %xmm0
000000000000dc0d	movsd	%xmm0, (%r12)
000000000000dc13	movq	%rbx, %rdi
000000000000dc16	callq	__ZN10PCSpinLock6unlockEv       ## PCSpinLock::unlock()
000000000000dc1b	leaq	-0x140(%rbp), %rdi
000000000000dc22	callq	__ZN19PCEvaluatorWaveDataD2Ev   ## PCEvaluatorWaveData::~PCEvaluatorWaveData()
000000000000dc27	addq	$0x138, %rsp                    ## imm = 0x138
000000000000dc2e	popq	%rbx
000000000000dc2f	popq	%r12
000000000000dc31	popq	%r13
000000000000dc33	popq	%r14
000000000000dc35	popq	%r15
000000000000dc37	popq	%rbp
000000000000dc38	retq
000000000000dc39	movl	%eax, -0x2c(%rbp)
000000000000dc3c	movsd	(%r14,%rax,8), %xmm1
000000000000dc42	movsd	0x8(%r14,%rax,8), %xmm0
000000000000dc49	subsd	%xmm1, %xmm0
000000000000dc4d	movapd	0x114a1b(%rip), %xmm2
000000000000dc55	andpd	%xmm0, %xmm2
000000000000dc59	movsd	0x114c1f(%rip), %xmm3
000000000000dc61	ucomisd	%xmm2, %xmm3
000000000000dc65	jbe	0xdc7b
000000000000dc67	movq	-0x58(%rbp), %r15
000000000000dc6b	movsd	(%r15,%rax,8), %xmm0
000000000000dc71	movapd	%xmm0, -0x40(%rbp)
000000000000dc76	jmp	0xdb50
000000000000dc7b	movq	-0x58(%rbp), %r15
000000000000dc7f	movsd	(%r15,%rax,8), %xmm5
000000000000dc85	movsd	0x8(%r15,%rax,8), %xmm2
000000000000dc8c	subsd	%xmm5, %xmm2
000000000000dc90	movapd	0x1149d8(%rip), %xmm4
000000000000dc98	andpd	%xmm2, %xmm4
000000000000dc9c	ucomisd	%xmm4, %xmm3
000000000000dca0	ja	0xdcb7
000000000000dca2	movsd	-0x48(%rbp), %xmm3
000000000000dca7	subsd	%xmm1, %xmm3
000000000000dcab	divsd	%xmm2, %xmm0
000000000000dcaf	divsd	%xmm0, %xmm3
000000000000dcb3	addsd	%xmm3, %xmm5
000000000000dcb7	movapd	%xmm5, -0x40(%rbp)
000000000000dcbc	jmp	0xdb50
000000000000dcc1	jmp	0xdccd
000000000000dcc3	jmp	0xdccd
000000000000dcc5	jmp	0xdccd
000000000000dcc7	jmp	0xdccd
000000000000dcc9	jmp	0xdccd
000000000000dccb	jmp	0xdccd
000000000000dccd	movq	%rax, %rbx
000000000000dcd0	leaq	-0x140(%rbp), %rdi
000000000000dcd7	callq	__ZN19PCEvaluatorWaveDataD2Ev   ## PCEvaluatorWaveData::~PCEvaluatorWaveData()
000000000000dcdc	movq	%rbx, %rdi
000000000000dcdf	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
