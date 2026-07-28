__ZN18OZDocumentTypeUndo4SwapEv:
0000000000102b00	movq	0x8(%rdi), %rax
0000000000102b04	testq	%rax, %rax
0000000000102b07	je	0x102b70
0000000000102b09	movq	0x8(%rax), %rcx
0000000000102b0d	testq	%rcx, %rcx
0000000000102b10	je	0x102b70
0000000000102b12	pushq	%rbp
0000000000102b13	movq	%rsp, %rbp
0000000000102b16	subq	$0x40, %rsp
0000000000102b1a	movq	0xa0(%rax), %rax
0000000000102b21	movq	0x7238b0(%rip), %rdx            ## literal pool symbol address: __NSConcreteStackBlock
0000000000102b28	movq	%rdx, -0x38(%rbp)
0000000000102b2c	movl	$0xe2000000, %edx               ## imm = 0xE2000000
0000000000102b31	movq	%rdx, -0x30(%rbp)
0000000000102b35	leaq	____ZN18OZDocumentTypeUndo4SwapEv_block_invoke(%rip), %rdx
0000000000102b3c	movq	%rdx, -0x28(%rbp)
0000000000102b40	leaq	"___block_descriptor_56_e8_32o_e267_{OZDocumentTypeUndoParams=i{vector<unsigned int, std::allocator<unsigned int>>=^I^I{?=^I}}{vector<OZDropZoneTypeUndoParams, std::allocator<OZDropZoneTypeUndoParams>>=^{OZDropZoneTypeUndoParams}^{OZDropZoneTypeUndoParams}{?=^{OZDropZoneTypeUndoParams}}}iIIIIBBBBB}8?0l"(%rip), %rdx
0000000000102b47	movq	%rdx, -0x20(%rbp)
0000000000102b4b	movq	%rdi, -0x10(%rbp)
0000000000102b4f	movq	%rcx, -0x8(%rbp)
0000000000102b53	movq	%rax, -0x18(%rbp)
0000000000102b57	movq	0x80755a(%rip), %rsi
0000000000102b5e	leaq	-0x38(%rbp), %rdx
0000000000102b62	movq	%rax, %rdi
0000000000102b65	callq	*0x7234bd(%rip)                 ## Objc message: -[%rdi getCurrentTool]
0000000000102b6b	addq	$0x40, %rsp
0000000000102b6f	popq	%rbp
0000000000102b70	retq
0000000000102b71	nopw	%cs:(%rax,%rax)
