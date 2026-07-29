__ZN17OZWriteOnBehavioraSERK10OZBehavior:
00000000004754b0	pushq	%rbp
00000000004754b1	movq	%rsp, %rbp
00000000004754b4	pushq	%r14
00000000004754b6	pushq	%rbx
00000000004754b7	movq	%rsi, %r14
00000000004754ba	movq	%rdi, %rbx
00000000004754bd	callq	__ZN17OZChannelBehavioraSERK10OZBehavior ## OZChannelBehavior::operator=(OZBehavior const&)
00000000004754c2	leaq	__ZTI10OZBehavior(%rip), %rsi   ## typeinfo for OZBehavior
00000000004754c9	leaq	__ZTI17OZWriteOnBehavior(%rip), %rdx ## typeinfo for OZWriteOnBehavior
00000000004754d0	movq	%r14, %rdi
00000000004754d3	xorl	%ecx, %ecx
00000000004754d5	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000004754da	testq	%rax, %rax
00000000004754dd	je	0x4755a2
00000000004754e3	movq	%rax, %r14
00000000004754e6	leaq	0x210(%rax), %rsi
00000000004754ed	leaq	0x210(%rbx), %rdi
00000000004754f4	callq	0x6dd938                        ## symbol stub for: __ZN13OZChannelBaseaSERKS_
00000000004754f9	leaq	0x310(%r14), %rsi
0000000000475500	leaq	0x310(%rbx), %rdi
0000000000475507	callq	0x6dd938                        ## symbol stub for: __ZN13OZChannelBaseaSERKS_
000000000047550c	leaq	0x3a8(%r14), %rsi
0000000000475513	leaq	0x3a8(%rbx), %rdi
000000000047551a	callq	0x6dd938                        ## symbol stub for: __ZN13OZChannelBaseaSERKS_
000000000047551f	leaq	0x440(%r14), %rsi
0000000000475526	leaq	0x440(%rbx), %rdi
000000000047552d	callq	0x6dd938                        ## symbol stub for: __ZN13OZChannelBaseaSERKS_
0000000000475532	leaq	0x540(%r14), %rsi
0000000000475539	leaq	0x540(%rbx), %rdi
0000000000475540	callq	0x6dd938                        ## symbol stub for: __ZN13OZChannelBaseaSERKS_
0000000000475545	leaq	0x640(%r14), %rsi
000000000047554c	leaq	0x640(%rbx), %rdi
0000000000475553	callq	0x6dd938                        ## symbol stub for: __ZN13OZChannelBaseaSERKS_
0000000000475558	leaq	0x770(%r14), %rsi
000000000047555f	leaq	0x770(%rbx), %rdi
0000000000475566	callq	0x6dd938                        ## symbol stub for: __ZN13OZChannelBaseaSERKS_
000000000047556b	addq	$0x6d8, %r14                    ## imm = 0x6D8
0000000000475572	leaq	0x6d8(%rbx), %rdi
0000000000475579	movq	%r14, %rsi
000000000047557c	callq	0x6dd938                        ## symbol stub for: __ZN13OZChannelBaseaSERKS_
0000000000475581	movq	0x3aef88(%rip), %rax            ## literal pool symbol address: _kCMTimeZero
0000000000475588	movups	(%rax), %xmm0
000000000047558b	movups	%xmm0, 0x840(%rbx)
0000000000475592	movq	0x10(%rax), %rax
0000000000475596	movq	%rax, 0x850(%rbx)
000000000047559d	popq	%rbx
000000000047559e	popq	%r14
00000000004755a0	popq	%rbp
00000000004755a1	retq
00000000004755a2	callq	0x6dfccc                        ## symbol stub for: ___cxa_bad_cast
00000000004755a7	nopw	(%rax,%rax)
