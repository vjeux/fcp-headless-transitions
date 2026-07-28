__ZN10OZFontFaceC1ERK8PCStringS2_P12OZFontFamily:
0000000000639840	pushq	%rbp
0000000000639841	movq	%rsp, %rbp
0000000000639844	pushq	%r15
0000000000639846	pushq	%r14
0000000000639848	pushq	%r12
000000000063984a	pushq	%rbx
000000000063984b	movq	%rcx, %rbx
000000000063984e	movq	%rdx, %r12
0000000000639851	movq	%rdi, %r15
0000000000639854	leaq	0x24f455(%rip), %rax
000000000063985b	movq	%rax, (%rdi)
000000000063985e	leaq	0x8(%rdi), %r14
0000000000639862	movq	%r14, %rdi
0000000000639865	callq	0x6df0ba                        ## symbol stub for: __ZN8PCStringC1ERKS_
000000000063986a	leaq	0x10(%r15), %rdi
000000000063986e	movq	%r12, %rsi
0000000000639871	callq	0x6df0ba                        ## symbol stub for: __ZN8PCStringC1ERKS_
0000000000639876	movq	%rbx, 0x18(%r15)
000000000063987a	popq	%rbx
000000000063987b	popq	%r12
000000000063987d	popq	%r14
000000000063987f	popq	%r15
0000000000639881	popq	%rbp
0000000000639882	retq
0000000000639883	movq	%rax, %rbx
0000000000639886	movq	%r14, %rdi
0000000000639889	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
000000000063988e	movq	%rbx, %rdi
0000000000639891	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000639896	nopw	%cs:(%rax,%rax)
