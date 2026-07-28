__ZN18OZWriteOnCurveNode9solveNodeER16OZCurveNodeParam:
0000000000477940	pushq	%rbp
0000000000477941	movq	%rsp, %rbp
0000000000477944	pushq	%r14
0000000000477946	pushq	%rbx
0000000000477947	movq	%rsi, %rbx
000000000047794a	movq	%rdi, %r14
000000000047794d	movq	0x8(%rdi), %rdi
0000000000477951	testq	%rdi, %rdi
0000000000477954	je	0x477970
0000000000477956	leaq	__ZTI10OZBehavior(%rip), %rsi   ## typeinfo for OZBehavior
000000000047795d	leaq	__ZTI17OZWriteOnBehavior(%rip), %rdx ## typeinfo for OZWriteOnBehavior
0000000000477964	xorl	%ecx, %ecx
0000000000477966	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000047796b	movq	%rax, %rdi
000000000047796e	jmp	0x477972
0000000000477970	xorl	%edi, %edi
0000000000477972	movq	0x10(%r14), %rsi
0000000000477976	movq	%rbx, %rdx
0000000000477979	popq	%rbx
000000000047797a	popq	%r14
000000000047797c	popq	%rbp
000000000047797d	jmp	__ZN17OZWriteOnBehavior16solveWriteOnNodeEP13OZChannelBaseR16OZCurveNodeParam ## OZWriteOnBehavior::solveWriteOnNode(OZChannelBase*, OZCurveNodeParam&)
0000000000477982	nopw	%cs:(%rax,%rax)
