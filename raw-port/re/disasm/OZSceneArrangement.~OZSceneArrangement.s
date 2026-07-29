__ZN18OZSceneArrangementD1Ev:
0000000000064040	pushq	%rbp
0000000000064041	movq	%rsp, %rbp
0000000000064044	pushq	%r14
0000000000064046	pushq	%rbx
0000000000064047	movq	%rdi, %rbx
000000000006404a	addq	$0x120, %rdi                    ## imm = 0x120
0000000000064051	leaq	__ZTV7PCArrayIN18OZSceneArrangement7ElementE14PCArray_TraitsIS1_EE(%rip), %r14 ## vtable for PCArray<OZSceneArrangement::Element, PCArray_Traits<OZSceneArrangement::Element>>
0000000000064058	addq	$0x10, %r14
000000000006405c	movq	%r14, 0x120(%rbx)
0000000000064063	movl	0x128(%rbx), %eax
0000000000064069	testl	%eax, %eax
000000000006406b	movl	$0x1, %edx
0000000000064070	cmovnsl	%eax, %edx
0000000000064073	xorl	%esi, %esi
0000000000064075	callq	__ZN7PCArrayIN18OZSceneArrangement7ElementE14PCArray_TraitsIS1_EE6resizeEii ## PCArray<OZSceneArrangement::Element, PCArray_Traits<OZSceneArrangement::Element>>::resize(int, int)
000000000006407a	movq	0x130(%rbx), %rdi
0000000000064081	testq	%rdi, %rdi
0000000000064084	je	0x6408b
0000000000064086	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000006408b	movq	$0x0, 0x130(%rbx)
0000000000064096	movl	$0x0, 0x128(%rbx)
00000000000640a0	leaq	0x108(%rbx), %rdi
00000000000640a7	movq	%r14, 0x108(%rbx)
00000000000640ae	movl	0x110(%rbx), %eax
00000000000640b4	testl	%eax, %eax
00000000000640b6	movl	$0x1, %edx
00000000000640bb	cmovnsl	%eax, %edx
00000000000640be	xorl	%esi, %esi
00000000000640c0	callq	__ZN7PCArrayIN18OZSceneArrangement7ElementE14PCArray_TraitsIS1_EE6resizeEii ## PCArray<OZSceneArrangement::Element, PCArray_Traits<OZSceneArrangement::Element>>::resize(int, int)
00000000000640c5	movq	0x118(%rbx), %rdi
00000000000640cc	testq	%rdi, %rdi
00000000000640cf	je	0x640d6
00000000000640d1	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
00000000000640d6	movq	$0x0, 0x118(%rbx)
00000000000640e1	movl	$0x0, 0x110(%rbx)
00000000000640eb	popq	%rbx
00000000000640ec	popq	%r14
00000000000640ee	popq	%rbp
00000000000640ef	retq
00000000000640f0	movq	%rax, %rdi
00000000000640f3	callq	___clang_call_terminate
00000000000640f8	movq	%rax, %rdi
00000000000640fb	callq	___clang_call_terminate
