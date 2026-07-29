__ZN19FFAudioDeviceObjectC2E20FFAudioSessionIOType:
0000000000d08900	pushq	%rbp
0000000000d08901	movq	%rsp, %rbp
0000000000d08904	pushq	%r15
0000000000d08906	pushq	%r14
0000000000d08908	pushq	%r12
0000000000d0890a	pushq	%rbx
0000000000d0890b	movq	%rdi, %rbx
0000000000d0890e	leaq	0xc087cb(%rip), %rax
0000000000d08915	movq	%rax, (%rdi)
0000000000d08918	movb	%sil, 0x8(%rdi)
0000000000d0891c	movq	$0x0, 0x10(%rdi)
0000000000d08924	testb	%sil, %sil
0000000000d08927	je	0xd0892d
0000000000d08929	xorl	%eax, %eax
0000000000d0892b	jmp	0xd08937
0000000000d0892d	movl	$0x10, %edi
0000000000d08932	callq	0x1497446                       ## symbol stub for: __Znam
0000000000d08937	movq	%rax, 0x18(%rbx)
0000000000d0893b	leaq	0x40(%rbx), %r14
0000000000d0893f	leaq	0x48(%rbx), %r15
0000000000d08943	xorps	%xmm0, %xmm0
0000000000d08946	movups	%xmm0, 0x20(%rbx)
0000000000d0894a	movups	%xmm0, 0x29(%rbx)
0000000000d0894e	movups	%xmm0, 0x40(%rbx)
0000000000d08952	movups	%xmm0, 0x50(%rbx)
0000000000d08956	movups	%xmm0, 0x60(%rbx)
0000000000d0895a	movups	%xmm0, 0x70(%rbx)
0000000000d0895e	movl	$0x1, 0x20(%rbx)
0000000000d08965	movq	0xbe6c04(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSMutableArray
0000000000d0896c	callq	0x1497908                       ## symbol stub for: _objc_alloc_init
0000000000d08971	movq	%rax, 0x80(%rbx)
0000000000d08978	popq	%rbx
0000000000d08979	popq	%r12
0000000000d0897b	popq	%r14
0000000000d0897d	popq	%r15
0000000000d0897f	popq	%rbp
0000000000d08980	retq
0000000000d08981	movq	%rax, %r12
0000000000d08984	movq	0x78(%rbx), %rdi
0000000000d08988	movq	$0x0, 0x78(%rbx)
0000000000d08990	testq	%rdi, %rdi
0000000000d08993	jne	0xd08a1d
0000000000d08999	movq	0x70(%rbx), %rdi
0000000000d0899d	movq	$0x0, 0x70(%rbx)
0000000000d089a5	testq	%rdi, %rdi
0000000000d089a8	jne	0xd08a37
0000000000d089ae	movq	0x68(%rbx), %rdi
0000000000d089b2	movq	$0x0, 0x68(%rbx)
0000000000d089ba	testq	%rdi, %rdi
0000000000d089bd	jne	0xd08a52
0000000000d089c3	movq	0x60(%rbx), %rdi
0000000000d089c7	movq	$0x0, 0x60(%rbx)
0000000000d089cf	testq	%rdi, %rdi
0000000000d089d2	jne	0xd08a6d
0000000000d089d8	movq	0x58(%rbx), %rdi
0000000000d089dc	movq	$0x0, 0x58(%rbx)
0000000000d089e4	testq	%rdi, %rdi
0000000000d089e7	je	0xd089ef
0000000000d089e9	movq	(%rdi), %rax
0000000000d089ec	callq	*0x20(%rax)
0000000000d089ef	movq	%r15, %rdi
0000000000d089f2	callq	__ZNSt3__110shared_ptrIN19FFAudioSamplesCache5BlockEED1B9nqe210106Ev ## std::__1::shared_ptr<FFAudioSamplesCache::Block>::~shared_ptr[abi:nqe210106]()
0000000000d089f7	movq	%r14, %rdi
0000000000d089fa	callq	__ZNSt3__110unique_ptrI12FFAudioGraphNS_14default_deleteIS1_EEED1B9nqe210106Ev ## std::__1::unique_ptr<FFAudioGraph, std::__1::default_delete<FFAudioGraph>>::~unique_ptr[abi:nqe210106]()
0000000000d089ff	movq	0x18(%rbx), %rdi
0000000000d08a03	movq	$0x0, 0x18(%rbx)
0000000000d08a0b	testq	%rdi, %rdi
0000000000d08a0e	je	0xd08a15
0000000000d08a10	callq	0x14973fe                       ## symbol stub for: __ZdaPv
0000000000d08a15	movq	%r12, %rdi
0000000000d08a18	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000d08a1d	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000000d08a22	movq	0x70(%rbx), %rdi
0000000000d08a26	movq	$0x0, 0x70(%rbx)
0000000000d08a2e	testq	%rdi, %rdi
0000000000d08a31	je	0xd089ae
0000000000d08a37	movq	(%rdi), %rax
0000000000d08a3a	callq	*0x8(%rax)
0000000000d08a3d	movq	0x68(%rbx), %rdi
0000000000d08a41	movq	$0x0, 0x68(%rbx)
0000000000d08a49	testq	%rdi, %rdi
0000000000d08a4c	je	0xd089c3
0000000000d08a52	movq	(%rdi), %rax
0000000000d08a55	callq	*0x8(%rax)
0000000000d08a58	movq	0x60(%rbx), %rdi
0000000000d08a5c	movq	$0x0, 0x60(%rbx)
0000000000d08a64	testq	%rdi, %rdi
0000000000d08a67	je	0xd089d8
0000000000d08a6d	movq	(%rdi), %rax
0000000000d08a70	callq	*0x20(%rax)
0000000000d08a73	movq	0x58(%rbx), %rdi
0000000000d08a77	movq	$0x0, 0x58(%rbx)
0000000000d08a7f	testq	%rdi, %rdi
0000000000d08a82	jne	0xd089e9
0000000000d08a88	jmp	0xd089ef
0000000000d08a8d	nopl	(%rax)
