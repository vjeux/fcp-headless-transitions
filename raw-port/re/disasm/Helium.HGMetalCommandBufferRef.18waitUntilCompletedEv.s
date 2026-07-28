__ZN23HGMetalCommandBufferRef18waitUntilCompletedEv:
00000000001d5480	pushq	%rbp
00000000001d5481	movq	%rsp, %rbp
00000000001d5484	pushq	%rbx
00000000001d5485	subq	$0x18, %rsp
00000000001d5489	movq	%rdi, %rbx
00000000001d548c	leaq	0x7214db(%rip), %rsi            ## literal pool for: "gpu"
00000000001d5493	leaq	0x721504(%rip), %rcx            ## literal pool for: "HGMetalCommandBufferRef::waitUntilCompleted"
00000000001d549a	leaq	-0x20(%rbp), %rdi
00000000001d549e	movl	$0x1, %edx
00000000001d54a3	callq	__ZN12HGTraceGuardC1EPKciS1_    ## HGTraceGuard::HGTraceGuard(char const*, int, char const*)
00000000001d54a8	movl	$0x1222, -0xc(%rbp)             ## imm = 0x1222
00000000001d54af	movl	$0x2b794888, %edi               ## imm = 0x2B794888
00000000001d54b4	xorl	%esi, %esi
00000000001d54b6	xorl	%edx, %edx
00000000001d54b8	xorl	%ecx, %ecx
00000000001d54ba	xorl	%r8d, %r8d
00000000001d54bd	callq	0x3c53d2                        ## symbol stub for: _kdebug_trace
00000000001d54c2	movq	(%rbx), %rdi
00000000001d54c5	movq	0x885a94(%rip), %rsi            ## Objc selector ref: waitUntilCompleted
00000000001d54cc	callq	*0x82cce6(%rip)                 ## Objc message: -[%rdi waitUntilCompleted]
00000000001d54d2	movl	$0x2b79488c, %edi               ## imm = 0x2B79488C
00000000001d54d7	xorl	%esi, %esi
00000000001d54d9	xorl	%edx, %edx
00000000001d54db	xorl	%ecx, %ecx
00000000001d54dd	xorl	%r8d, %r8d
00000000001d54e0	callq	0x3c53d2                        ## symbol stub for: _kdebug_trace
00000000001d54e5	leaq	-0x20(%rbp), %rdi
00000000001d54e9	callq	__ZN12HGTraceGuardD1Ev          ## HGTraceGuard::~HGTraceGuard()
00000000001d54ee	addq	$0x18, %rsp
00000000001d54f2	popq	%rbx
00000000001d54f3	popq	%rbp
00000000001d54f4	retq
00000000001d54f5	movq	%rax, %rdi
00000000001d54f8	callq	___clang_call_terminate
00000000001d54fd	movq	%rax, %rbx
00000000001d5500	leaq	-0xc(%rbp), %rdi
00000000001d5504	callq	__ZN10HGSignPost15EventScopeGuardD1Ev ## HGSignPost::EventScopeGuard::~EventScopeGuard()
00000000001d5509	leaq	-0x20(%rbp), %rdi
00000000001d550d	callq	__ZN12HGTraceGuardD1Ev          ## HGTraceGuard::~HGTraceGuard()
00000000001d5512	movq	%rbx, %rdi
00000000001d5515	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d551a	movq	%rax, %rbx
00000000001d551d	leaq	-0x20(%rbp), %rdi
00000000001d5521	callq	__ZN12HGTraceGuardD1Ev          ## HGTraceGuard::~HGTraceGuard()
00000000001d5526	movq	%rbx, %rdi
00000000001d5529	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d552e	nop
