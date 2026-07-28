__ZN21OZHGMotionEstimateJobC2EPN13OZOpticalFlow7Private12AnalyzerImplE:
00000000004db7c0	pushq	%rbp
00000000004db7c1	movq	%rsp, %rbp
00000000004db7c4	pushq	%r14
00000000004db7c6	pushq	%rbx
00000000004db7c7	movq	%rsi, %r14
00000000004db7ca	movq	%rdi, %rbx
00000000004db7cd	xorl	%esi, %esi
00000000004db7cf	callq	__ZN11OZHGUserJobC2EPU28objcproto17OZHGUserJobClient11objc_object ## OZHGUserJob::OZHGUserJob(id<OZHGUserJobClient>)
00000000004db7d4	leaq	0x39b8e5(%rip), %rax
00000000004db7db	movq	%rax, (%rbx)
00000000004db7de	movq	%r14, 0x90(%rbx)
00000000004db7e5	movq	%rbx, %rdi
00000000004db7e8	xorl	%esi, %esi
00000000004db7ea	callq	0x6df22e                        ## symbol stub for: __ZN9HGUserJob11SetPriorityENS_8PriorityE
00000000004db7ef	callq	0x6de0c4                        ## symbol stub for: __ZN15PGHGRenderQueue21getOpticalFlowQueueIDEv
00000000004db7f4	movq	%rbx, %rdi
00000000004db7f7	movl	%eax, %esi
00000000004db7f9	callq	0x6df228                        ## symbol stub for: __ZN9HGUserJob10SetQueueIDEj
00000000004db7fe	popq	%rbx
00000000004db7ff	popq	%r14
00000000004db801	popq	%rbp
00000000004db802	retq
00000000004db803	movq	%rax, %r14
00000000004db806	movq	%rbx, %rdi
00000000004db809	callq	__ZN11OZHGUserJobD2Ev           ## OZHGUserJob::~OZHGUserJob()
00000000004db80e	movq	%r14, %rdi
00000000004db811	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004db816	nopw	%cs:(%rax,%rax)
__ZN21OZHGMotionEstimateJobC1EPN13OZOpticalFlow7Private12AnalyzerImplE:
00000000004db820	pushq	%rbp

__ZN21OZHGMotionEstimateJobC1EPN13OZOpticalFlow7Private12AnalyzerImplE:
00000000004db820	pushq	%rbp
00000000004db821	movq	%rsp, %rbp
00000000004db824	pushq	%r14
00000000004db826	pushq	%rbx
00000000004db827	movq	%rsi, %r14
00000000004db82a	movq	%rdi, %rbx
00000000004db82d	xorl	%esi, %esi
00000000004db82f	callq	__ZN11OZHGUserJobC2EPU28objcproto17OZHGUserJobClient11objc_object ## OZHGUserJob::OZHGUserJob(id<OZHGUserJobClient>)
00000000004db834	leaq	0x39b885(%rip), %rax
00000000004db83b	movq	%rax, (%rbx)
00000000004db83e	movq	%r14, 0x90(%rbx)
00000000004db845	movq	%rbx, %rdi
00000000004db848	xorl	%esi, %esi
00000000004db84a	callq	0x6df22e                        ## symbol stub for: __ZN9HGUserJob11SetPriorityENS_8PriorityE
00000000004db84f	callq	0x6de0c4                        ## symbol stub for: __ZN15PGHGRenderQueue21getOpticalFlowQueueIDEv
00000000004db854	movq	%rbx, %rdi
00000000004db857	movl	%eax, %esi
00000000004db859	callq	0x6df228                        ## symbol stub for: __ZN9HGUserJob10SetQueueIDEj
00000000004db85e	popq	%rbx
00000000004db85f	popq	%r14
00000000004db861	popq	%rbp
00000000004db862	retq
00000000004db863	movq	%rax, %r14
00000000004db866	movq	%rbx, %rdi
00000000004db869	callq	__ZN11OZHGUserJobD2Ev           ## OZHGUserJob::~OZHGUserJob()
00000000004db86e	movq	%r14, %rdi
00000000004db871	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004db876	nopw	%cs:(%rax,%rax)
__ZN21OZHGMotionEstimateJobD2Ev:
00000000004db880	pushq	%rbp

__ZN21OZHGMotionEstimateJobD2Ev:
00000000004db880	pushq	%rbp
00000000004db881	movq	%rsp, %rbp
00000000004db884	popq	%rbp
00000000004db885	jmp	__ZN11OZHGUserJobD2Ev           ## OZHGUserJob::~OZHGUserJob()
00000000004db88a	nopw	(%rax,%rax)
__ZN21OZHGMotionEstimateJobD1Ev:

__ZN21OZHGMotionEstimateJobD1Ev:
00000000004db890	pushq	%rbp
00000000004db891	movq	%rsp, %rbp
00000000004db894	popq	%rbp
00000000004db895	jmp	__ZN11OZHGUserJobD2Ev           ## OZHGUserJob::~OZHGUserJob()
00000000004db89a	nopw	(%rax,%rax)
__ZN21OZHGMotionEstimateJobD0Ev:

__ZN21OZHGMotionEstimateJobD0Ev:
00000000004db8a0	pushq	%rbp
00000000004db8a1	movq	%rsp, %rbp
00000000004db8a4	pushq	%rbx
00000000004db8a5	pushq	%rax
00000000004db8a6	movq	%rdi, %rbx
00000000004db8a9	callq	__ZN11OZHGUserJobD2Ev           ## OZHGUserJob::~OZHGUserJob()
00000000004db8ae	movq	%rbx, %rdi
00000000004db8b1	addq	$0x8, %rsp
00000000004db8b5	popq	%rbx
00000000004db8b6	popq	%rbp
00000000004db8b7	jmp	0x6def6a                        ## symbol stub for: __ZN8HGObjectdlEPv
00000000004db8bc	nopl	(%rax)

__ZN21OZHGMotionEstimateJob9executingEv:
00000000004db8c0	pushq	%rbp
00000000004db8c1	movq	%rsp, %rbp
00000000004db8c4	movq	0x90(%rdi), %rax
00000000004db8cb	leaq	0x48(%rdi), %rsi
00000000004db8cf	movq	%rax, %rdi
00000000004db8d2	popq	%rbp
00000000004db8d3	jmp	__ZN13OZOpticalFlow7Private12AnalyzerImpl14estimateMotionER16OZProcessControl ## OZOpticalFlow::Private::AnalyzerImpl::estimateMotion(OZProcessControl&)
00000000004db8d8	nopl	(%rax,%rax)

