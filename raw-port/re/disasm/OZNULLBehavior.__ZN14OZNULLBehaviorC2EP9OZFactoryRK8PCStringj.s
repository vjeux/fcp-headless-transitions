__ZN14OZNULLBehaviorC2EP9OZFactoryRK8PCStringj:
0000000000354030	pushq	%rbp
0000000000354031	movq	%rsp, %rbp
0000000000354034	pushq	%r14
0000000000354036	pushq	%rbx
0000000000354037	subq	$0x10, %rsp
000000000035403b	movq	%rdx, %r14
000000000035403e	movq	%rdi, %rbx
0000000000354041	callq	__ZN10OZBehaviorC2EP9OZFactoryRK8PCStringj ## OZBehavior::OZBehavior(OZFactory*, PCString const&, unsigned int)
0000000000354046	leaq	0x4fe313(%rip), %rax
000000000035404d	movq	%rax, (%rbx)
0000000000354050	leaq	0x4fe591(%rip), %rax
0000000000354057	movq	%rax, 0x10(%rbx)
000000000035405b	leaq	0x4fe7de(%rip), %rax
0000000000354062	movq	%rax, 0x28(%rbx)
0000000000354066	leaq	_theApp(%rip), %rax
000000000035406d	movq	(%rax), %rax
0000000000354070	movq	0x48(%rax), %rdx
0000000000354074	leaq	0x548395(%rip), %rsi            ## Objc cfstring ref: @"bad cfstring ref"
000000000035407b	leaq	-0x18(%rbp), %rdi
000000000035407f	xorl	%ecx, %ecx
0000000000354081	callq	0x6df08a                        ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
0000000000354086	leaq	-0x18(%rbp), %rdi
000000000035408a	movq	%r14, %rsi
000000000035408d	callq	0x6df060                        ## symbol stub for: __ZN8PCString6appendERKS_
0000000000354092	leaq	0x10(%rbx), %rdi
0000000000354096	movq	(%rdi), %rax
0000000000354099	leaq	-0x18(%rbp), %rsi
000000000035409d	xorl	%edx, %edx
000000000035409f	callq	*0x70(%rax)
00000000003540a2	leaq	-0x18(%rbp), %rdi
00000000003540a6	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000003540ab	addq	$0x10, %rsp
00000000003540af	popq	%rbx
00000000003540b0	popq	%r14
00000000003540b2	popq	%rbp
00000000003540b3	retq
00000000003540b4	movq	%rax, %r14
00000000003540b7	movq	%rbx, %rdi
00000000003540ba	callq	__ZN10OZBehaviorD2Ev            ## OZBehavior::~OZBehavior()
00000000003540bf	movq	%r14, %rdi
00000000003540c2	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000003540c7	movq	%rax, %r14
00000000003540ca	leaq	-0x18(%rbp), %rdi
00000000003540ce	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000003540d3	movq	%rbx, %rdi
00000000003540d6	callq	__ZN10OZBehaviorD2Ev            ## OZBehavior::~OZBehavior()
00000000003540db	movq	%r14, %rdi
00000000003540de	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000003540e3	nopw	%cs:(%rax,%rax)
