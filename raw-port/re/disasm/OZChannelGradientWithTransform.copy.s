__ZN30OZChannelGradientWithTransform4copyEPK13OZChannelBaseb:
0000000000499370	pushq	%rbp
0000000000499371	movq	%rsp, %rbp
0000000000499374	pushq	%r15
0000000000499376	pushq	%r14
0000000000499378	pushq	%rbx
0000000000499379	pushq	%rax
000000000049937a	movl	%edx, %r14d
000000000049937d	movq	%rsi, %r15
0000000000499380	movq	%rdi, %rbx
0000000000499383	callq	0x6de8aa                        ## symbol stub for: __ZN27OZChannelGradientPositioned4copyEPK13OZChannelBaseb
0000000000499388	testq	%r15, %r15
000000000049938b	je	0x4993aa
000000000049938d	movq	0x38939c(%rip), %rsi            ## literal pool symbol address: __ZTI13OZChannelBase
0000000000499394	leaq	__ZTI30OZChannelGradientWithTransform(%rip), %rdx ## typeinfo for OZChannelGradientWithTransform
000000000049939b	movq	%r15, %rdi
000000000049939e	xorl	%ecx, %ecx
00000000004993a0	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000004993a5	movq	%rax, %r15
00000000004993a8	jmp	0x4993ad
00000000004993aa	xorl	%r15d, %r15d
00000000004993ad	leaq	0x9a8(%rbx), %rdi
00000000004993b4	leaq	0x9a8(%r15), %rsi
00000000004993bb	movzbl	%r14b, %r14d
00000000004993bf	movl	%r14d, %edx
00000000004993c2	callq	0x6dd980                        ## symbol stub for: __ZN13OZChannelEnum4copyEPK13OZChannelBaseb
00000000004993c7	leaq	0xaa8(%rbx), %rdi
00000000004993ce	leaq	0xaa8(%r15), %rsi
00000000004993d5	movl	%r14d, %edx
00000000004993d8	callq	0x6dd980                        ## symbol stub for: __ZN13OZChannelEnum4copyEPK13OZChannelBaseb
00000000004993dd	addq	$0xba8, %rbx                    ## imm = 0xBA8
00000000004993e4	addq	$0xba8, %r15                    ## imm = 0xBA8
00000000004993eb	movq	%rbx, %rdi
00000000004993ee	movq	%r15, %rsi
00000000004993f1	movl	%r14d, %edx
00000000004993f4	addq	$0x8, %rsp
00000000004993f8	popq	%rbx
00000000004993f9	popq	%r14
00000000004993fb	popq	%r15
00000000004993fd	popq	%rbp
00000000004993fe	jmp	0x6dd980                        ## symbol stub for: __ZN13OZChannelEnum4copyEPK13OZChannelBaseb
0000000000499403	nopw	%cs:(%rax,%rax)
