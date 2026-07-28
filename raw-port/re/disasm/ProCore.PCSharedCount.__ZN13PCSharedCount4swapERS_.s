__ZN13PCSharedCount4swapERS_:
000000000004e156	pushq	%rbp
000000000004e157	movq	%rsp, %rbp
000000000004e15a	movq	(%rsi), %rax
000000000004e15d	movq	(%rdi), %rcx
000000000004e160	movq	%rcx, (%rsi)
000000000004e163	movq	%rax, (%rdi)
000000000004e166	popq	%rbp
000000000004e167	retq
