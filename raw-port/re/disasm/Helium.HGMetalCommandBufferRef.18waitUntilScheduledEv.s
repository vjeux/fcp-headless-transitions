__ZN23HGMetalCommandBufferRef18waitUntilScheduledEv:
00000000001d53d0	pushq	%rbp
00000000001d53d1	movq	%rsp, %rbp
00000000001d53d4	pushq	%rbx
00000000001d53d5	subq	$0x18, %rsp
00000000001d53d9	movq	%rdi, %rbx
00000000001d53dc	leaq	0x72158b(%rip), %rsi            ## literal pool for: "gpu"
00000000001d53e3	leaq	0x721588(%rip), %rcx            ## literal pool for: "HGMetalCommandBufferRef::waitUntilScheduled"
00000000001d53ea	leaq	-0x20(%rbp), %rdi
00000000001d53ee	movl	$0x1, %edx
00000000001d53f3	callq	__ZN12HGTraceGuardC1EPKciS1_    ## HGTraceGuard::HGTraceGuard(char const*, int, char const*)
00000000001d53f8	movl	$0x1220, -0xc(%rbp)             ## imm = 0x1220
00000000001d53ff	movl	$0x2b794880, %edi               ## imm = 0x2B794880
00000000001d5404	xorl	%esi, %esi
00000000001d5406	xorl	%edx, %edx
00000000001d5408	xorl	%ecx, %ecx
00000000001d540a	xorl	%r8d, %r8d
00000000001d540d	callq	0x3c53d2                        ## symbol stub for: _kdebug_trace
00000000001d5412	movq	(%rbx), %rdi
00000000001d5415	movq	0x885f0c(%rip), %rsi            ## Objc selector ref: waitUntilScheduled
00000000001d541c	callq	*0x82cd96(%rip)                 ## Objc message: -[%rdi waitUntilScheduled]
00000000001d5422	movl	$0x2b794884, %edi               ## imm = 0x2B794884
00000000001d5427	xorl	%esi, %esi
00000000001d5429	xorl	%edx, %edx
00000000001d542b	xorl	%ecx, %ecx
00000000001d542d	xorl	%r8d, %r8d
00000000001d5430	callq	0x3c53d2                        ## symbol stub for: _kdebug_trace
00000000001d5435	leaq	-0x20(%rbp), %rdi
00000000001d5439	callq	__ZN12HGTraceGuardD1Ev          ## HGTraceGuard::~HGTraceGuard()
00000000001d543e	addq	$0x18, %rsp
00000000001d5442	popq	%rbx
00000000001d5443	popq	%rbp
00000000001d5444	retq
00000000001d5445	movq	%rax, %rdi
00000000001d5448	callq	___clang_call_terminate
00000000001d544d	movq	%rax, %rbx
00000000001d5450	leaq	-0xc(%rbp), %rdi
00000000001d5454	callq	__ZN10HGSignPost15EventScopeGuardD1Ev ## HGSignPost::EventScopeGuard::~EventScopeGuard()
00000000001d5459	leaq	-0x20(%rbp), %rdi
00000000001d545d	callq	__ZN12HGTraceGuardD1Ev          ## HGTraceGuard::~HGTraceGuard()
00000000001d5462	movq	%rbx, %rdi
00000000001d5465	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d546a	movq	%rax, %rbx
00000000001d546d	leaq	-0x20(%rbp), %rdi
00000000001d5471	callq	__ZN12HGTraceGuardD1Ev          ## HGTraceGuard::~HGTraceGuard()
00000000001d5476	movq	%rbx, %rdi
00000000001d5479	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001d547e	nop
