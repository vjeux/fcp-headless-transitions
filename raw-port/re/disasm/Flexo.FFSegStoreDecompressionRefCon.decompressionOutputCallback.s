__ZN29FFSegStoreDecompressionRefCon27decompressionOutputCallbackEPvS0_ijP10__CVBuffer6CMTimeS3_:
000000000126ecf0	pushq	%rbp
000000000126ecf1	movq	%rsp, %rbp
000000000126ecf4	pushq	%r15
000000000126ecf6	pushq	%r14
000000000126ecf8	pushq	%r13
000000000126ecfa	pushq	%r12
000000000126ecfc	pushq	%rbx
000000000126ecfd	subq	$0x48, %rsp
000000000126ed01	testq	%rsi, %rsi
000000000126ed04	je	0x126efcb
000000000126ed0a	movq	%r8, %r15
000000000126ed0d	movl	%edx, %r14d
000000000126ed10	movq	%rsi, %rbx
000000000126ed13	movq	%rsi, -0x58(%rbp)
000000000126ed17	movb	$0x0, -0x50(%rbp)
000000000126ed1b	movq	%rsi, %rdi
000000000126ed1e	callq	__ZN16FFSynchronizable4LockEv   ## FFSynchronizable::Lock()
000000000126ed23	movq	%r15, 0x98(%rbx)
000000000126ed2a	movl	%r14d, 0x94(%rbx)
000000000126ed31	testq	%r15, %r15
000000000126ed34	je	0x126ed3e
000000000126ed36	movq	%r15, %rdi
000000000126ed39	callq	0x1495346                       ## symbol stub for: _CVBufferRetain
000000000126ed3e	testl	%r14d, %r14d
000000000126ed41	je	0x126efb3
000000000126ed47	leaq	0x10(%rbp), %r13
000000000126ed4b	callq	0x149791a                       ## symbol stub for: _objc_autoreleasePoolPush
000000000126ed50	movq	%rax, -0x48(%rbp)
000000000126ed54	movl	0xc(%r13), %r14d
000000000126ed58	movq	0x10(%r13), %r15
000000000126ed5c	movl	%r14d, %eax
000000000126ed5f	andl	$0x1d, %eax
000000000126ed62	cmpl	$0x1, %eax
000000000126ed65	jne	0x126edd5
000000000126ed67	movq	(%r13), %rax
000000000126ed6b	movq	%rax, -0x40(%rbp)
000000000126ed6f	movl	0x8(%r13), %eax
000000000126ed73	movl	%eax, -0x30(%rbp)
000000000126ed76	testq	%r15, %r15
000000000126ed79	setne	%al
000000000126ed7c	movl	%r14d, %ecx
000000000126ed7f	andl	$0x2, %ecx
000000000126ed82	shrl	%ecx
000000000126ed84	movq	0x67e7dd(%rip), %rdx            ## literal pool symbol address: _OBJC_CLASS_$_NSString
000000000126ed8b	movq	%rdx, -0x38(%rbp)
000000000126ed8f	orb	%al, %cl
000000000126ed91	jne	0x126ee67
000000000126ed97	movq	0x10(%r13), %rax
000000000126ed9b	movq	%rax, 0x10(%rsp)
000000000126eda0	movups	(%r13), %xmm0
000000000126eda5	movups	%xmm0, (%rsp)
000000000126eda9	callq	0x1495130                       ## symbol stub for: _CMTimeGetSeconds
000000000126edae	movq	0x949763(%rip), %rsi
000000000126edb5	leaq	0x6e34cc(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
000000000126edbc	movq	-0x38(%rbp), %rdi
000000000126edc0	movq	-0x40(%rbp), %rcx
000000000126edc4	movl	-0x30(%rbp), %r8d
000000000126edc8	movb	$0x1, %al
000000000126edca	callq	*0x67e8f0(%rip)                 ## Objc message: -[%rdi appendData:]
000000000126edd0	jmp	0x126efaa
000000000126edd5	movl	%r14d, %r12d
000000000126edd8	notl	%r12d
000000000126eddb	testb	$0x5, %r12b
000000000126eddf	setne	%al
000000000126ede2	testb	$0x9, %r12b
000000000126ede6	setne	%cl
000000000126ede9	testb	%cl, %al
000000000126edeb	jne	0x126efaa
000000000126edf1	testq	%r15, %r15
000000000126edf4	je	0x126eed3
000000000126edfa	movq	0x67e767(%rip), %rax            ## literal pool symbol address: _OBJC_CLASS_$_NSString
000000000126ee01	movq	%rax, -0x30(%rbp)
000000000126ee05	movq	0x10(%r13), %rax
000000000126ee09	movq	%rax, 0x10(%rsp)
000000000126ee0e	movups	(%r13), %xmm0
000000000126ee13	movups	%xmm0, (%rsp)
000000000126ee17	callq	0x1495130                       ## symbol stub for: _CMTimeGetSeconds
000000000126ee1c	andl	$0x1f, %r14d
000000000126ee20	cmpl	$0x3, %r14d
000000000126ee24	leaq	0x37b2cd(%rip), %r8             ## literal pool for: "+round"
000000000126ee2b	leaq	0x423226(%rip), %rax            ## literal pool for: ""
000000000126ee32	cmovneq	%rax, %r8
000000000126ee36	testb	$0x11, %r12b
000000000126ee3a	leaq	0x37b2be(%rip), %r9             ## literal pool for: "+indef"
000000000126ee41	cmovneq	%rax, %r9
000000000126ee45	movq	0x9496cc(%rip), %rsi
000000000126ee4c	leaq	0x6c1335(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
000000000126ee53	movq	-0x30(%rbp), %rdi
000000000126ee57	movq	%r15, %rcx
000000000126ee5a	movb	$0x1, %al
000000000126ee5c	callq	*0x67e85e(%rip)                 ## Objc message: -[%rdi appendData:]
000000000126ee62	jmp	0x126efaa
000000000126ee67	notl	%r14d
000000000126ee6a	testb	$0x3, %r14b
000000000126ee6e	leaq	0x37b283(%rip), %r12            ## literal pool for: "+round"
000000000126ee75	leaq	0x4231dc(%rip), %r14            ## literal pool for: ""
000000000126ee7c	cmovneq	%r14, %r12
000000000126ee80	testq	%r15, %r15
000000000126ee83	je	0x126ef4f
000000000126ee89	movq	0x10(%r13), %rax
000000000126ee8d	movq	%rax, 0x10(%rsp)
000000000126ee92	movups	(%r13), %xmm0
000000000126ee97	movups	%xmm0, (%rsp)
000000000126ee9b	callq	0x1495130                       ## symbol stub for: _CMTimeGetSeconds
000000000126eea0	movq	0x949671(%rip), %rsi
000000000126eea7	movq	%r14, 0x8(%rsp)
000000000126eeac	movq	%r12, (%rsp)
000000000126eeb0	leaq	0x6e33f1(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
000000000126eeb7	movq	-0x38(%rbp), %rdi
000000000126eebb	movq	-0x40(%rbp), %rcx
000000000126eebf	movl	-0x30(%rbp), %r8d
000000000126eec3	movq	%r15, %r9
000000000126eec6	movb	$0x1, %al
000000000126eec8	callq	*0x67e7f2(%rip)                 ## Objc message: -[%rdi appendData:]
000000000126eece	jmp	0x126efaa
000000000126eed3	movq	0x67e68e(%rip), %r15            ## literal pool symbol address: _OBJC_CLASS_$_NSString
000000000126eeda	movq	0x10(%r13), %rax
000000000126eede	movq	%rax, 0x10(%rsp)
000000000126eee3	movups	(%r13), %xmm0
000000000126eee8	movups	%xmm0, (%rsp)
000000000126eeec	callq	0x1495130                       ## symbol stub for: _CMTimeGetSeconds
000000000126eef1	movl	%r14d, %eax
000000000126eef4	andl	$0x1f, %eax
000000000126eef7	andl	$0x11, %r14d
000000000126eefb	cmpl	$0x11, %r14d
000000000126eeff	sete	%cl
000000000126ef02	cmpl	$0x3, %eax
000000000126ef05	sete	%dl
000000000126ef08	orb	%cl, %dl
000000000126ef0a	je	0x126ef91
000000000126ef10	cmpl	$0x3, %eax
000000000126ef13	leaq	0x37b1de(%rip), %rcx            ## literal pool for: "+round"
000000000126ef1a	leaq	0x423137(%rip), %rax            ## literal pool for: ""
000000000126ef21	cmovneq	%rax, %rcx
000000000126ef25	cmpl	$0x11, %r14d
000000000126ef29	leaq	0x37b1cf(%rip), %r8             ## literal pool for: "+indef"
000000000126ef30	cmovneq	%rax, %r8
000000000126ef34	movq	0x9495dd(%rip), %rsi
000000000126ef3b	leaq	0x6c1266(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
000000000126ef42	movq	%r15, %rdi
000000000126ef45	movb	$0x1, %al
000000000126ef47	callq	*0x67e773(%rip)                 ## Objc message: -[%rdi appendData:]
000000000126ef4d	jmp	0x126efaa
000000000126ef4f	movq	0x10(%r13), %rax
000000000126ef53	movq	%rax, 0x10(%rsp)
000000000126ef58	movups	(%r13), %xmm0
000000000126ef5d	movups	%xmm0, (%rsp)
000000000126ef61	callq	0x1495130                       ## symbol stub for: _CMTimeGetSeconds
000000000126ef66	movq	0x9495ab(%rip), %rsi
000000000126ef6d	movq	%r14, (%rsp)
000000000126ef71	leaq	0x6e3350(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
000000000126ef78	movq	-0x38(%rbp), %rdi
000000000126ef7c	movq	-0x40(%rbp), %rcx
000000000126ef80	movl	-0x30(%rbp), %r8d
000000000126ef84	movq	%r12, %r9
000000000126ef87	movb	$0x1, %al
000000000126ef89	callq	*0x67e731(%rip)                 ## Objc message: -[%rdi appendData:]
000000000126ef8f	jmp	0x126efaa
000000000126ef91	movq	0x949580(%rip), %rsi
000000000126ef98	leaq	0x6c11c9(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
000000000126ef9f	movq	%r15, %rdi
000000000126efa2	movb	$0x1, %al
000000000126efa4	callq	*0x67e716(%rip)                 ## Objc message: -[%rdi appendData:]
000000000126efaa	movq	-0x48(%rbp), %rdi
000000000126efae	callq	0x1497914                       ## symbol stub for: _objc_autoreleasePoolPop
000000000126efb3	movb	$0x1, 0x90(%rbx)
000000000126efba	leaq	0x40(%rbx), %rdi
000000000126efbe	callq	0x1497a70                       ## symbol stub for: _pthread_cond_broadcast
000000000126efc3	movq	%rbx, %rdi
000000000126efc6	callq	__ZN16FFSynchronizable6UnlockEv ## FFSynchronizable::Unlock()
000000000126efcb	addq	$0x48, %rsp
000000000126efcf	popq	%rbx
000000000126efd0	popq	%r12
000000000126efd2	popq	%r13
000000000126efd4	popq	%r14
000000000126efd6	popq	%r15
000000000126efd8	popq	%rbp
000000000126efd9	retq
000000000126efda	movq	%rax, %rdi
000000000126efdd	callq	___clang_call_terminate
000000000126efe2	movq	%rax, %rbx
000000000126efe5	leaq	-0x58(%rbp), %rdi
000000000126efe9	callq	__ZN14FFSynchronizerD1Ev        ## FFSynchronizer::~FFSynchronizer()
000000000126efee	movq	%rbx, %rdi
000000000126eff1	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
000000000126eff6	nopw	%cs:(%rax,%rax)
