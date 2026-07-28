__ZN18OZWriteOnCurveNode9solveNodeERK6CMTimedd:
00000000004778e0	pushq	%rbp
00000000004778e1	movq	%rsp, %rbp
00000000004778e4	pushq	%r14
00000000004778e6	pushq	%rbx
00000000004778e7	subq	$0x10, %rsp
00000000004778eb	movq	%rsi, %rbx
00000000004778ee	movq	%rdi, %r14
00000000004778f1	movq	0x8(%rdi), %rdi
00000000004778f5	testq	%rdi, %rdi
00000000004778f8	je	0x477928
00000000004778fa	leaq	__ZTI10OZBehavior(%rip), %rsi   ## typeinfo for OZBehavior
0000000000477901	leaq	__ZTI17OZWriteOnBehavior(%rip), %rdx ## typeinfo for OZWriteOnBehavior
0000000000477908	xorl	%ecx, %ecx
000000000047790a	movsd	%xmm1, -0x20(%rbp)
000000000047790f	movsd	%xmm0, -0x18(%rbp)
0000000000477914	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000477919	movsd	-0x18(%rbp), %xmm0
000000000047791e	movsd	-0x20(%rbp), %xmm1
0000000000477923	movq	%rax, %rdi
0000000000477926	jmp	0x47792a
0000000000477928	xorl	%edi, %edi
000000000047792a	movq	0x10(%r14), %rsi
000000000047792e	movq	%rbx, %rdx
0000000000477931	addq	$0x10, %rsp
0000000000477935	popq	%rbx
0000000000477936	popq	%r14
0000000000477938	popq	%rbp
0000000000477939	jmp	__ZN17OZWriteOnBehavior16solveWriteOnNodeEP13OZChannelBaseRK6CMTimedd ## OZWriteOnBehavior::solveWriteOnNode(OZChannelBase*, CMTime const&, double, double)
000000000047793e	nop
