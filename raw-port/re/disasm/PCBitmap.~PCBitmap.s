__ZN8PCBitmapD1Ev:
000000000003a850	movq	0x7e8f29(%rip), %rax            ## literal pool symbol address: __ZTV8PCBitmap
000000000003a857	addq	$0x10, %rax
000000000003a85b	movq	%rax, (%rdi)
000000000003a85e	movq	0x40(%rdi), %rax
000000000003a862	movq	$0x0, 0x40(%rdi)
000000000003a86a	testq	%rax, %rax
000000000003a86d	je	0x6deee0                        ## symbol stub for: __ZN7PCImageD2Ev
000000000003a873	pushq	%rbp
000000000003a874	movq	%rsp, %rbp
000000000003a877	pushq	%rbx
000000000003a878	pushq	%rax
000000000003a879	movq	(%rax), %rcx
000000000003a87c	movq	%rdi, %rbx
000000000003a87f	movq	%rax, %rdi
000000000003a882	callq	*0x8(%rcx)
000000000003a885	movq	%rbx, %rdi
000000000003a888	addq	$0x8, %rsp
000000000003a88c	popq	%rbx
000000000003a88d	popq	%rbp
000000000003a88e	jmp	0x6deee0                        ## symbol stub for: __ZN7PCImageD2Ev
000000000003a893	nopw	%cs:(%rax,%rax)
