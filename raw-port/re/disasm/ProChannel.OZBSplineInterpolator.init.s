__ZN21OZBSplineInterpolator4initER8OZSplineRK6CMTime:
000000000004229a	pushq	%rbp
000000000004229b	movq	%rsp, %rbp
000000000004229e	pushq	%r15
00000000000422a0	pushq	%r14
00000000000422a2	pushq	%rbx
00000000000422a3	pushq	%rax
00000000000422a4	movq	%rsi, %rbx
00000000000422a7	movq	%rdi, %r14
00000000000422aa	movb	0x90(%rsi), %r15b
00000000000422b1	movq	0x88208(%rip), %rsi             ## literal pool symbol address: _kCMTimeZero
00000000000422b8	movq	%rbx, %rdi
00000000000422bb	callq	__ZN8OZSpline40getNumberOfValidVerticesWithMultiplicityERK6CMTime ## OZSpline::getNumberOfValidVerticesWithMultiplicity(CMTime const&)
00000000000422c0	cmpb	$0x1, %r15b
00000000000422c4	jne	0x422df
00000000000422c6	addl	$0x3, %eax
00000000000422c9	movl	%eax, 0x20(%r14)
00000000000422cd	movl	$0x4, 0x70(%r14)
00000000000422d5	movq	%r14, %rdi
00000000000422d8	callq	__ZN21OZBSplineInterpolator26generatePeriodicKnotVectorER8OZSpline ## OZBSplineInterpolator::generatePeriodicKnotVector(OZSpline&)
00000000000422dd	jmp	0x422fa
00000000000422df	movl	%eax, 0x20(%r14)
00000000000422e3	cmpl	$0x4, %eax
00000000000422e6	movl	$0x4, %ecx
00000000000422eb	cmovbl	%eax, %ecx
00000000000422ee	movl	%ecx, 0x70(%r14)
00000000000422f2	movq	%r14, %rdi
00000000000422f5	callq	__ZN21OZBSplineInterpolator22generateOpenKnotVectorER8OZSpline ## OZBSplineInterpolator::generateOpenKnotVector(OZSpline&)
00000000000422fa	movq	%rbx, %rdi
00000000000422fd	xorl	%esi, %esi
00000000000422ff	addq	$0x8, %rsp
0000000000042303	popq	%rbx
0000000000042304	popq	%r14
0000000000042306	popq	%r15
0000000000042308	popq	%rbp
0000000000042309	jmp	__ZN8OZSpline8setDirtyEb        ## OZSpline::setDirty(bool)
