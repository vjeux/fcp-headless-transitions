__ZN21FFAutoReframeAnalysis24GetCropForAnchoredObjectEP16FFAnchoredObject6CGRectR28FFAutoReframeAnalysisResults:
00000000013106d0	pushq	%rbp
00000000013106d1	movq	%rsp, %rbp
00000000013106d4	pushq	%r15
00000000013106d6	pushq	%r14
00000000013106d8	pushq	%r12
00000000013106da	pushq	%rbx
00000000013106db	subq	$0x80, %rsp
00000000013106e2	movq	%rsi, %rbx
00000000013106e5	movq	%rdi, %r15
00000000013106e8	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000013106f2	movq	%rax, -0x40(%rbp)
00000000013106f6	movq	%rax, -0x38(%rbp)
00000000013106fa	movaps	0x10(%rbp), %xmm0
00000000013106fe	movaps	0x20(%rbp), %xmm1
0000000001310702	movups	%xmm1, 0x10(%rsp)
0000000001310707	movups	%xmm0, (%rsp)
000000000131070b	callq	0x1494ea2                       ## symbol stub for: _CGRectGetMidX
0000000001310710	movsd	%xmm0, -0x28(%rbp)
0000000001310715	movaps	0x10(%rbp), %xmm0
0000000001310719	movaps	0x20(%rbp), %xmm1
000000000131071d	movups	%xmm1, 0x10(%rsp)
0000000001310722	movups	%xmm0, (%rsp)
0000000001310726	callq	0x1494ea8                       ## symbol stub for: _CGRectGetMidY
000000000131072b	movsd	%xmm0, -0x30(%rbp)
0000000001310730	movq	%r15, %rdi
0000000001310733	callq	_FFModelLockFromRef
0000000001310738	movq	%rax, %r14
000000000131073b	movq	0x8a80d6(%rip), %rsi
0000000001310742	movq	0x5dcf77(%rip), %r12            ## Objc message: -[%rdi arranged]
0000000001310749	movq	%rax, %rdi
000000000131074c	callq	*%r12
000000000131074f	movq	0x8aa842(%rip), %rsi
0000000001310756	movq	%r15, %rdi
0000000001310759	callq	*%r12
000000000131075c	movq	0x8aec75(%rip), %rsi
0000000001310763	leaq	-0x40(%rbp), %rdx
0000000001310767	leaq	-0x38(%rbp), %rcx
000000000131076b	leaq	-0x80(%rbp), %r8
000000000131076f	leaq	-0x60(%rbp), %r9
0000000001310773	movq	%rax, %rdi
0000000001310776	callq	*0x5dcf44(%rip)                 ## Objc message: -[%rdi arranged]
000000000131077c	xorl	%r15d, %r15d
000000000131077f	movq	0x8a80b2(%rip), %rsi
0000000001310786	movq	%r14, %rdi
0000000001310789	callq	*0x5dcf31(%rip)                 ## Objc message: -[%rdi arranged]
000000000131078f	testb	%r15b, %r15b
0000000001310792	movsd	-0x30(%rbp), %xmm6
0000000001310797	movsd	-0x28(%rbp), %xmm7
000000000131079c	jne	0x131093f
00000000013107a2	movq	0x5dc51f(%rip), %rax            ## literal pool symbol address: _CGPointZero
00000000013107a9	movsd	(%rax), %xmm0
00000000013107ad	cmpeqsd	%xmm7, %xmm0
00000000013107b2	movsd	0x8(%rax), %xmm1
00000000013107b7	cmpeqsd	%xmm6, %xmm1
00000000013107bc	andpd	%xmm0, %xmm1
00000000013107c0	movd	%xmm1, %eax
00000000013107c4	movupd	-0x50(%rbp), %xmm2
00000000013107c9	movupd	-0x70(%rbp), %xmm0
00000000013107ce	movapd	%xmm2, %xmm3
00000000013107d2	divpd	%xmm0, %xmm3
00000000013107d6	movapd	%xmm3, %xmm5
00000000013107da	unpckhpd	%xmm3, %xmm5                    ## xmm5 = xmm5[1],xmm3[1]
00000000013107de	ucomisd	%xmm5, %xmm3
00000000013107e2	movapd	%xmm2, %xmm1
00000000013107e6	unpckhpd	%xmm2, %xmm1                    ## xmm1 = xmm1[1],xmm2[1]
00000000013107ea	jbe	0x131082e
00000000013107ec	movsd	0x25c244(%rip), %xmm3
00000000013107f4	movapd	%xmm3, %xmm4
00000000013107f8	testb	$0x1, %al
00000000013107fa	jne	0x1310800
00000000013107fc	movapd	%xmm7, %xmm4
0000000001310800	mulsd	%xmm5, %xmm0
0000000001310804	movapd	%xmm2, %xmm5
0000000001310808	subsd	%xmm0, %xmm5
000000000131080c	mulsd	%xmm3, %xmm5
0000000001310810	movsd	%xmm5, 0x10(%rbx)
0000000001310815	movsd	%xmm5, 0x18(%rbx)
000000000131081a	mulsd	%xmm1, %xmm3
000000000131081e	movsd	0x20(%rbx), %xmm6
0000000001310823	movsd	0x28(%rbx), %xmm0
0000000001310828	movapd	%xmm5, %xmm7
000000000131082c	jmp	0x131087a
000000000131082e	unpckhpd	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1]
0000000001310832	mulsd	%xmm0, %xmm3
0000000001310836	movapd	%xmm1, %xmm0
000000000131083a	subsd	%xmm3, %xmm0
000000000131083e	movsd	0x25c1f2(%rip), %xmm4
0000000001310846	mulsd	%xmm4, %xmm0
000000000131084a	movsd	%xmm0, 0x28(%rbx)
000000000131084f	movsd	%xmm0, 0x20(%rbx)
0000000001310854	movapd	%xmm4, %xmm3
0000000001310858	testb	$0x1, %al
000000000131085a	jne	0x1310868
000000000131085c	movsd	0x25c19c(%rip), %xmm3
0000000001310864	subsd	%xmm6, %xmm3
0000000001310868	mulsd	%xmm1, %xmm3
000000000131086c	movsd	0x10(%rbx), %xmm7
0000000001310871	movsd	0x18(%rbx), %xmm5
0000000001310876	movapd	%xmm0, %xmm6
000000000131087a	addsd	%xmm6, %xmm0
000000000131087e	addsd	%xmm7, %xmm5
0000000001310882	movapd	%xmm2, %xmm6
0000000001310886	subsd	%xmm5, %xmm6
000000000131088a	movapd	%xmm1, %xmm5
000000000131088e	subsd	%xmm0, %xmm5
0000000001310892	ucomisd	%xmm2, %xmm6
0000000001310896	jne	0x131089a
0000000001310898	jnp	0x13108e1
000000000131089a	mulsd	%xmm2, %xmm4
000000000131089e	movsd	0x25c192(%rip), %xmm7
00000000013108a6	mulsd	%xmm6, %xmm7
00000000013108aa	movapd	%xmm4, %xmm0
00000000013108ae	addsd	%xmm7, %xmm0
00000000013108b2	movapd	%xmm2, %xmm8
00000000013108b7	subsd	%xmm7, %xmm8
00000000013108bc	cmpltsd	%xmm2, %xmm0
00000000013108c1	blendvpd	%xmm0, %xmm4, %xmm8
00000000013108c7	subsd	%xmm7, %xmm8
00000000013108cc	movsd	%xmm8, 0x10(%rbx)
00000000013108d2	addsd	%xmm6, %xmm8
00000000013108d7	subsd	%xmm8, %xmm2
00000000013108dc	movsd	%xmm2, 0x18(%rbx)
00000000013108e1	ucomisd	%xmm1, %xmm5
00000000013108e5	jne	0x13108e9
00000000013108e7	jnp	0x131092f
00000000013108e9	movsd	0x25c147(%rip), %xmm2
00000000013108f1	mulsd	%xmm5, %xmm2
00000000013108f5	ucomisd	%xmm2, %xmm3
00000000013108f9	movapd	%xmm2, %xmm4
00000000013108fd	jbe	0x1310919
00000000013108ff	movapd	%xmm3, %xmm0
0000000001310903	addsd	%xmm2, %xmm0
0000000001310907	movapd	%xmm1, %xmm4
000000000131090b	subsd	%xmm2, %xmm4
000000000131090f	cmpltsd	%xmm1, %xmm0
0000000001310914	blendvpd	%xmm0, %xmm3, %xmm4
0000000001310919	subsd	%xmm2, %xmm4
000000000131091d	movsd	%xmm4, 0x28(%rbx)
0000000001310922	addsd	%xmm4, %xmm5
0000000001310926	subsd	%xmm5, %xmm1
000000000131092a	movsd	%xmm1, 0x20(%rbx)
000000000131092f	addq	$0x80, %rsp
0000000001310936	popq	%rbx
0000000001310937	popq	%r12
0000000001310939	popq	%r14
000000000131093b	popq	%r15
000000000131093d	popq	%rbp
000000000131093e	retq
000000000131093f	callq	0x1497944                       ## symbol stub for: _objc_exception_rethrow
0000000001310944	ud2
0000000001310946	movq	%rax, %rbx
0000000001310949	jmp	0x1310953
000000000131094b	movq	%rax, %rbx
000000000131094e	testb	%r15b, %r15b
0000000001310951	je	0x1310958
0000000001310953	callq	0x1497938                       ## symbol stub for: _objc_end_catch
0000000001310958	movq	%rbx, %rdi
000000000131095b	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000001310960	movq	%rax, %rdi
0000000001310963	callq	___clang_call_terminate
0000000001310968	movq	%rax, %rdi
000000000131096b	callq	0x1497926                       ## symbol stub for: _objc_begin_catch
0000000001310970	movb	$0x1, %r15b
0000000001310973	jmp	0x131077f
0000000001310978	nopl	(%rax,%rax)
