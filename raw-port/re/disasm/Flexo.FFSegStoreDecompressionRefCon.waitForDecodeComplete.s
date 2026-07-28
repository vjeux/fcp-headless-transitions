__ZN29FFSegStoreDecompressionRefCon21waitForDecodeCompleteEb:
000000000126f000	pushq	%rbp
000000000126f001	movq	%rsp, %rbp
000000000126f004	pushq	%r15
000000000126f006	pushq	%r14
000000000126f008	pushq	%r13
000000000126f00a	pushq	%r12
000000000126f00c	pushq	%rbx
000000000126f00d	subq	$0x28, %rsp
000000000126f011	movl	%esi, %r12d
000000000126f014	movq	%rdi, %rbx
000000000126f017	callq	_FFGetHostTimeSeconds
000000000126f01c	movsd	%xmm0, -0x40(%rbp)
000000000126f021	movq	%rbx, -0x38(%rbp)
000000000126f025	movb	$0x0, -0x30(%rbp)
000000000126f029	movq	%rbx, %rdi
000000000126f02c	callq	__ZN16FFSynchronizable4LockEv   ## FFSynchronizable::Lock()
000000000126f031	movb	$0x1, %r15b
000000000126f034	cmpb	$0x0, 0x90(%rbx)
000000000126f03b	jne	0x126f183
000000000126f041	movq	0x9494d0(%rip), %r14
000000000126f048	testb	%r12b, %r12b
000000000126f04b	je	0x126f0ab
000000000126f04d	leaq	-0x38(%rbp), %r12
000000000126f051	nopw	%cs:(%rax,%rax)
000000000126f060	callq	_FFGetHostTimeSeconds
000000000126f065	subsd	-0x40(%rbp), %xmm0
000000000126f06a	movsd	0x2fdb9e(%rip), %xmm1
000000000126f072	ucomisd	%xmm0, %xmm1
000000000126f076	jbe	0x126f1a4
000000000126f07c	subsd	%xmm0, %xmm1
000000000126f080	mulsd	0x2fda38(%rip), %xmm1
000000000126f088	addsd	0x2fd970(%rip), %xmm1
000000000126f090	cvttsd2si	%xmm1, %rsi
000000000126f095	movq	%r12, %rdi
000000000126f098	callq	__ZN14FFSynchronizer7WaitForEj  ## FFSynchronizer::WaitFor(unsigned int)
000000000126f09d	cmpb	$0x0, 0x90(%rbx)
000000000126f0a4	je	0x126f060
000000000126f0a6	jmp	0x126f183
000000000126f0ab	xorl	%r13d, %r13d
000000000126f0ae	leaq	-0x38(%rbp), %r15
000000000126f0b2	jmp	0x126f0ee
000000000126f0b4	nopw	%cs:(%rax,%rax)
000000000126f0c0	subsd	%xmm0, %xmm1
000000000126f0c4	mulsd	0x2fd9f4(%rip), %xmm1
000000000126f0cc	addsd	0x2fd92c(%rip), %xmm1
000000000126f0d4	cvttsd2si	%xmm1, %rsi
000000000126f0d9	movq	%r15, %rdi
000000000126f0dc	callq	__ZN14FFSynchronizer7WaitForEj  ## FFSynchronizer::WaitFor(unsigned int)
000000000126f0e1	cmpb	$0x0, 0x90(%rbx)
000000000126f0e8	jne	0x126f180
000000000126f0ee	callq	_FFGetHostTimeSeconds
000000000126f0f3	subsd	-0x40(%rbp), %xmm0
000000000126f0f8	movsd	0x2fdb10(%rip), %xmm1
000000000126f100	ucomisd	%xmm0, %xmm1
000000000126f104	ja	0x126f0c0
000000000126f106	testb	$0x1, %r13b
000000000126f10a	jne	0x126f137
000000000126f10c	movq	0x67e455(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSString
000000000126f113	movq	0xa0(%rbx), %r8
000000000126f11a	movq	%r14, %rsi
000000000126f11d	leaq	0x764444(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
000000000126f124	movsd	0x2fdae4(%rip), %xmm0
000000000126f12c	movq	%rbx, %rcx
000000000126f12f	movb	$0x1, %al
000000000126f131	callq	*0x67e589(%rip)                 ## Objc message: -[%rdi appendData:]
000000000126f137	movq	-0x38(%rbp), %r13
000000000126f13b	movq	%r13, -0x50(%rbp)
000000000126f13f	movl	0x78(%r13), %r12d
000000000126f143	movl	%r12d, -0x48(%rbp)
000000000126f147	movl	$0x0, 0x78(%r13)
000000000126f14f	movq	$0x0, 0x70(%r13)
000000000126f157	leaq	0x40(%r13), %rdi
000000000126f15b	movq	%r13, %rsi
000000000126f15e	callq	0x1497a94                       ## symbol stub for: _pthread_cond_wait
000000000126f163	movl	%r12d, 0x78(%r13)
000000000126f167	callq	0x1497b12                       ## symbol stub for: _pthread_self
000000000126f16c	movq	%rax, 0x70(%r13)
000000000126f170	movb	$0x1, %r13b
000000000126f173	cmpb	$0x0, 0x90(%rbx)
000000000126f17a	je	0x126f0ee
000000000126f180	movb	$0x1, %r15b
000000000126f183	cmpb	$0x0, -0x30(%rbp)
000000000126f187	jne	0x126f192
000000000126f189	movq	-0x38(%rbp), %rdi
000000000126f18d	callq	__ZN16FFSynchronizable6UnlockEv ## FFSynchronizable::Unlock()
000000000126f192	movl	%r15d, %eax
000000000126f195	addq	$0x28, %rsp
000000000126f199	popq	%rbx
000000000126f19a	popq	%r12
000000000126f19c	popq	%r13
000000000126f19e	popq	%r14
000000000126f1a0	popq	%r15
000000000126f1a2	popq	%rbp
000000000126f1a3	retq
000000000126f1a4	movq	0x67e3bd(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSString
000000000126f1ab	movq	0xa0(%rbx), %r8
000000000126f1b2	leaq	0x7643af(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
000000000126f1b9	movsd	0x2fda4f(%rip), %xmm0
000000000126f1c1	movq	%r14, %rsi
000000000126f1c4	movq	%rbx, %rcx
000000000126f1c7	movb	$0x1, %al
000000000126f1c9	callq	*0x67e4f1(%rip)                 ## Objc message: -[%rdi appendData:]
000000000126f1cf	movzbl	0x90(%rbx), %r15d
000000000126f1d7	cmpb	$0x0, -0x30(%rbp)
000000000126f1db	je	0x126f189
000000000126f1dd	jmp	0x126f192
000000000126f1df	jmp	0x126f216
000000000126f1e1	movq	%rax, %rdi
000000000126f1e4	callq	___clang_call_terminate
000000000126f1e9	jmp	0x126f216
000000000126f1eb	jmp	0x126f216
000000000126f1ed	movq	%rax, %rdi
000000000126f1f0	callq	___clang_call_terminate
000000000126f1f5	movq	%rax, %rbx
000000000126f1f8	leaq	-0x50(%rbp), %rdi
000000000126f1fc	callq	__ZN16FFSynchronizable10WaitHelperD1Ev ## FFSynchronizable::WaitHelper::~WaitHelper()
000000000126f201	leaq	-0x38(%rbp), %rdi
000000000126f205	callq	__ZN14FFSynchronizerD1Ev        ## FFSynchronizer::~FFSynchronizer()
000000000126f20a	movq	%rbx, %rdi
000000000126f20d	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
000000000126f212	jmp	0x126f216
000000000126f214	jmp	0x126f216
000000000126f216	movq	%rax, %rbx
000000000126f219	leaq	-0x38(%rbp), %rdi
000000000126f21d	callq	__ZN14FFSynchronizerD1Ev        ## FFSynchronizer::~FFSynchronizer()
000000000126f222	movq	%rbx, %rdi
000000000126f225	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
000000000126f22a	nopw	(%rax,%rax)
