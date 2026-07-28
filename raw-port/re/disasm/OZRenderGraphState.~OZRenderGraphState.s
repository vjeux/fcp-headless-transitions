__ZN18OZRenderGraphStateD1Ev:
00000000000778d0	pushq	%rbp
00000000000778d1	movq	%rsp, %rbp
00000000000778d4	pushq	%r14
00000000000778d6	pushq	%rbx
00000000000778d7	movq	%rdi, %rbx
00000000000778da	addq	$0xe0, %rdi
00000000000778e1	leaq	__ZTV7PCArrayI7LiLight14PCArray_TraitsIS0_EE(%rip), %rax ## vtable for PCArray<LiLight, PCArray_Traits<LiLight>>
00000000000778e8	addq	$0x10, %rax
00000000000778ec	movq	%rax, 0xe0(%rbx)
00000000000778f3	movl	0xe8(%rbx), %eax
00000000000778f9	testl	%eax, %eax
00000000000778fb	movl	$0x1, %edx
0000000000077900	cmovnsl	%eax, %edx
0000000000077903	xorl	%esi, %esi
0000000000077905	callq	__ZN7PCArrayI7LiLight14PCArray_TraitsIS0_EE6resizeEii ## PCArray<LiLight, PCArray_Traits<LiLight>>::resize(int, int)
000000000007790a	movq	0xf0(%rbx), %rdi
0000000000077911	testq	%rdi, %rdi
0000000000077914	je	0x7791b
0000000000077916	callq	0x6dfc30                        ## symbol stub for: __ZdaPv
000000000007791b	movq	$0x0, 0xf0(%rbx)
0000000000077926	movl	$0x0, 0xe8(%rbx)
0000000000077930	cmpq	$0x0, 0x50(%rbx)
0000000000077935	je	0x77971
0000000000077937	leaq	0x40(%rbx), %r14
000000000007793b	movq	0x40(%rbx), %rax
000000000007793f	movq	0x48(%rbx), %rdi
0000000000077943	movq	0x8(%rax), %rax
0000000000077947	movq	(%rdi), %rcx
000000000007794a	movq	%rax, 0x8(%rcx)
000000000007794e	movq	%rcx, (%rax)
0000000000077951	movq	$0x0, 0x50(%rbx)
0000000000077959	cmpq	%r14, %rdi
000000000007795c	je	0x77971
000000000007795e	nop
0000000000077960	movq	0x8(%rdi), %rbx
0000000000077964	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000077969	movq	%rbx, %rdi
000000000007796c	cmpq	%r14, %rbx
000000000007796f	jne	0x77960
0000000000077971	popq	%rbx
0000000000077972	popq	%r14
0000000000077974	popq	%rbp
0000000000077975	retq
0000000000077976	movq	%rax, %rdi
0000000000077979	callq	___clang_call_terminate
000000000007797e	nop
