__ZN22HGTexturePoolingPolicy16setManagerHandleE5HGRefI22HGTextureManagerHandleE:
0000000000044cb0	pushq	%rbp
0000000000044cb1	movq	%rsp, %rbp
0000000000044cb4	pushq	%r14
0000000000044cb6	pushq	%rbx
0000000000044cb7	movq	%rdi, %rbx
0000000000044cba	movq	0x10(%rdi), %rax
0000000000044cbe	movq	(%rsi), %rdi
0000000000044cc1	cmpq	%rdi, %rax
0000000000044cc4	je	0x44ced
0000000000044cc6	testq	%rax, %rax
0000000000044cc9	je	0x44cda
0000000000044ccb	movq	%rsi, %r14
0000000000044cce	movq	(%rax), %rcx
0000000000044cd1	movq	%rax, %rdi
0000000000044cd4	callq	*0x18(%rcx)
0000000000044cd7	movq	(%r14), %rdi
0000000000044cda	movq	%rdi, 0x10(%rbx)
0000000000044cde	testq	%rdi, %rdi
0000000000044ce1	je	0x44ced
0000000000044ce3	movq	(%rdi), %rax
0000000000044ce6	popq	%rbx
0000000000044ce7	popq	%r14
0000000000044ce9	popq	%rbp
0000000000044cea	jmpq	*0x10(%rax)
0000000000044ced	popq	%rbx
0000000000044cee	popq	%r14
0000000000044cf0	popq	%rbp
0000000000044cf1	retq
0000000000044cf2	nopw	%cs:(%rax,%rax)
