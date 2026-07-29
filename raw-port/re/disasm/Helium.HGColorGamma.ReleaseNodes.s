__ZN12HGColorGamma12ReleaseNodesEv:
00000000000f5ac0	pushq	%rbp
00000000000f5ac1	movq	%rsp, %rbp
00000000000f5ac4	pushq	%rbx
00000000000f5ac5	pushq	%rax
00000000000f5ac6	movq	%rdi, %rbx
00000000000f5ac9	movq	0x1a8(%rdi), %rdi
00000000000f5ad0	testq	%rdi, %rdi
00000000000f5ad3	je	0xf5ae6
00000000000f5ad5	movq	(%rdi), %rax
00000000000f5ad8	callq	*0x18(%rax)
00000000000f5adb	movq	$0x0, 0x1a8(%rbx)
00000000000f5ae6	movq	0x1b0(%rbx), %rdi
00000000000f5aed	testq	%rdi, %rdi
00000000000f5af0	je	0xf5b03
00000000000f5af2	movq	(%rdi), %rax
00000000000f5af5	callq	*0x18(%rax)
00000000000f5af8	movq	$0x0, 0x1b0(%rbx)
00000000000f5b03	movq	0x1c8(%rbx), %rdi
00000000000f5b0a	testq	%rdi, %rdi
00000000000f5b0d	je	0xf5b20
00000000000f5b0f	movq	(%rdi), %rax
00000000000f5b12	callq	*0x18(%rax)
00000000000f5b15	movq	$0x0, 0x1c8(%rbx)
00000000000f5b20	movq	0x1b8(%rbx), %rdi
00000000000f5b27	testq	%rdi, %rdi
00000000000f5b2a	je	0xf5b3d
00000000000f5b2c	movq	(%rdi), %rax
00000000000f5b2f	callq	*0x18(%rax)
00000000000f5b32	movq	$0x0, 0x1b8(%rbx)
00000000000f5b3d	movq	0x1c0(%rbx), %rdi
00000000000f5b44	testq	%rdi, %rdi
00000000000f5b47	je	0xf5b5a
00000000000f5b49	movq	(%rdi), %rax
00000000000f5b4c	callq	*0x18(%rax)
00000000000f5b4f	movq	$0x0, 0x1c0(%rbx)
00000000000f5b5a	movq	0x1d0(%rbx), %rdi
00000000000f5b61	testq	%rdi, %rdi
00000000000f5b64	je	0xf5b77
00000000000f5b66	movq	(%rdi), %rax
00000000000f5b69	callq	*0x18(%rax)
00000000000f5b6c	movq	$0x0, 0x1d0(%rbx)
00000000000f5b77	movq	0x280(%rbx), %rdi
00000000000f5b7e	testq	%rdi, %rdi
00000000000f5b81	je	0xf5b94
00000000000f5b83	movq	(%rdi), %rax
00000000000f5b86	callq	*0x18(%rax)
00000000000f5b89	movq	$0x0, 0x280(%rbx)
00000000000f5b94	movq	0x288(%rbx), %rdi
00000000000f5b9b	testq	%rdi, %rdi
00000000000f5b9e	je	0xf5bb1
00000000000f5ba0	movq	(%rdi), %rax
00000000000f5ba3	callq	*0x18(%rax)
00000000000f5ba6	movq	$0x0, 0x288(%rbx)
00000000000f5bb1	movq	0x290(%rbx), %rdi
00000000000f5bb8	testq	%rdi, %rdi
00000000000f5bbb	je	0xf5bce
00000000000f5bbd	movq	(%rdi), %rax
00000000000f5bc0	callq	*0x18(%rax)
00000000000f5bc3	movq	$0x0, 0x290(%rbx)
00000000000f5bce	movq	0x298(%rbx), %rdi
00000000000f5bd5	testq	%rdi, %rdi
00000000000f5bd8	je	0xf5beb
00000000000f5bda	movq	(%rdi), %rax
00000000000f5bdd	callq	*0x18(%rax)
00000000000f5be0	movq	$0x0, 0x298(%rbx)
00000000000f5beb	movq	0x2a0(%rbx), %rdi
00000000000f5bf2	testq	%rdi, %rdi
00000000000f5bf5	je	0xf5c08
00000000000f5bf7	movq	(%rdi), %rax
00000000000f5bfa	callq	*0x18(%rax)
00000000000f5bfd	movq	$0x0, 0x2a0(%rbx)
00000000000f5c08	movq	0x2a8(%rbx), %rdi
00000000000f5c0f	testq	%rdi, %rdi
00000000000f5c12	je	0xf5c25
00000000000f5c14	movq	(%rdi), %rax
00000000000f5c17	callq	*0x18(%rax)
00000000000f5c1a	movq	$0x0, 0x2a8(%rbx)
00000000000f5c25	movq	0x2b0(%rbx), %rdi
00000000000f5c2c	testq	%rdi, %rdi
00000000000f5c2f	je	0xf5c42
00000000000f5c31	movq	(%rdi), %rax
00000000000f5c34	callq	*0x18(%rax)
00000000000f5c37	movq	$0x0, 0x2b0(%rbx)
00000000000f5c42	movq	0x2b8(%rbx), %rdi
00000000000f5c49	testq	%rdi, %rdi
00000000000f5c4c	je	0xf5c5f
00000000000f5c4e	movq	(%rdi), %rax
00000000000f5c51	callq	*0x18(%rax)
00000000000f5c54	movq	$0x0, 0x2b8(%rbx)
00000000000f5c5f	movq	0x2c0(%rbx), %rdi
00000000000f5c66	testq	%rdi, %rdi
00000000000f5c69	je	0xf5c7c
00000000000f5c6b	movq	(%rdi), %rax
00000000000f5c6e	callq	*0x18(%rax)
00000000000f5c71	movq	$0x0, 0x2c0(%rbx)
00000000000f5c7c	movq	0x2c8(%rbx), %rdi
00000000000f5c83	testq	%rdi, %rdi
00000000000f5c86	je	0xf5c99
00000000000f5c88	movq	(%rdi), %rax
00000000000f5c8b	callq	*0x18(%rax)
00000000000f5c8e	movq	$0x0, 0x2c8(%rbx)
00000000000f5c99	movq	0x1d8(%rbx), %rdi
00000000000f5ca0	testq	%rdi, %rdi
00000000000f5ca3	je	0xf5cb6
00000000000f5ca5	movq	(%rdi), %rax
00000000000f5ca8	callq	*0x18(%rax)
00000000000f5cab	movq	$0x0, 0x1d8(%rbx)
00000000000f5cb6	movq	0x1e0(%rbx), %rdi
00000000000f5cbd	testq	%rdi, %rdi
00000000000f5cc0	je	0xf5cd3
00000000000f5cc2	movq	(%rdi), %rax
00000000000f5cc5	callq	*0x18(%rax)
00000000000f5cc8	movq	$0x0, 0x1e0(%rbx)
00000000000f5cd3	movq	0x1f0(%rbx), %rdi
00000000000f5cda	testq	%rdi, %rdi
00000000000f5cdd	je	0xf5cf0
00000000000f5cdf	movq	(%rdi), %rax
00000000000f5ce2	callq	*0x18(%rax)
00000000000f5ce5	movq	$0x0, 0x1f0(%rbx)
00000000000f5cf0	movq	0x1e8(%rbx), %rdi
00000000000f5cf7	testq	%rdi, %rdi
00000000000f5cfa	je	0xf5d0d
00000000000f5cfc	movq	(%rdi), %rax
00000000000f5cff	callq	*0x18(%rax)
00000000000f5d02	movq	$0x0, 0x1e8(%rbx)
00000000000f5d0d	movq	0x1f8(%rbx), %rdi
00000000000f5d14	testq	%rdi, %rdi
00000000000f5d17	je	0xf5d2a
00000000000f5d19	movq	(%rdi), %rax
00000000000f5d1c	callq	*0x18(%rax)
00000000000f5d1f	movq	$0x0, 0x1f8(%rbx)
00000000000f5d2a	movq	0x200(%rbx), %rdi
00000000000f5d31	testq	%rdi, %rdi
00000000000f5d34	je	0xf5d47
00000000000f5d36	movq	(%rdi), %rax
00000000000f5d39	callq	*0x18(%rax)
00000000000f5d3c	movq	$0x0, 0x200(%rbx)
00000000000f5d47	movq	0x208(%rbx), %rdi
00000000000f5d4e	testq	%rdi, %rdi
00000000000f5d51	je	0xf5d64
00000000000f5d53	movq	(%rdi), %rax
00000000000f5d56	callq	*0x18(%rax)
00000000000f5d59	movq	$0x0, 0x208(%rbx)
00000000000f5d64	movq	0x230(%rbx), %rdi
00000000000f5d6b	testq	%rdi, %rdi
00000000000f5d6e	je	0xf5d81
00000000000f5d70	movq	(%rdi), %rax
00000000000f5d73	callq	*0x18(%rax)
00000000000f5d76	movq	$0x0, 0x230(%rbx)
00000000000f5d81	movq	0x238(%rbx), %rdi
00000000000f5d88	testq	%rdi, %rdi
00000000000f5d8b	je	0xf5d9e
00000000000f5d8d	movq	(%rdi), %rax
00000000000f5d90	callq	*0x18(%rax)
00000000000f5d93	movq	$0x0, 0x238(%rbx)
00000000000f5d9e	movq	0x210(%rbx), %rdi
00000000000f5da5	testq	%rdi, %rdi
00000000000f5da8	je	0xf5dbb
00000000000f5daa	movq	(%rdi), %rax
00000000000f5dad	callq	*0x18(%rax)
00000000000f5db0	movq	$0x0, 0x210(%rbx)
00000000000f5dbb	movq	0x220(%rbx), %rdi
00000000000f5dc2	testq	%rdi, %rdi
00000000000f5dc5	je	0xf5dd8
00000000000f5dc7	movq	(%rdi), %rax
00000000000f5dca	callq	*0x18(%rax)
00000000000f5dcd	movq	$0x0, 0x220(%rbx)
00000000000f5dd8	movq	0x240(%rbx), %rdi
00000000000f5ddf	testq	%rdi, %rdi
00000000000f5de2	je	0xf5df5
00000000000f5de4	movq	(%rdi), %rax
00000000000f5de7	callq	*0x18(%rax)
00000000000f5dea	movq	$0x0, 0x240(%rbx)
00000000000f5df5	movq	0x248(%rbx), %rdi
00000000000f5dfc	testq	%rdi, %rdi
00000000000f5dff	je	0xf5e12
00000000000f5e01	movq	(%rdi), %rax
00000000000f5e04	callq	*0x18(%rax)
00000000000f5e07	movq	$0x0, 0x248(%rbx)
00000000000f5e12	movq	0x250(%rbx), %rdi
00000000000f5e19	testq	%rdi, %rdi
00000000000f5e1c	je	0xf5e2f
00000000000f5e1e	movq	(%rdi), %rax
00000000000f5e21	callq	*0x18(%rax)
00000000000f5e24	movq	$0x0, 0x250(%rbx)
00000000000f5e2f	movq	0x258(%rbx), %rdi
00000000000f5e36	testq	%rdi, %rdi
00000000000f5e39	je	0xf5e4c
00000000000f5e3b	movq	(%rdi), %rax
00000000000f5e3e	callq	*0x18(%rax)
00000000000f5e41	movq	$0x0, 0x258(%rbx)
00000000000f5e4c	movq	0x260(%rbx), %rdi
00000000000f5e53	testq	%rdi, %rdi
00000000000f5e56	je	0xf5e69
00000000000f5e58	movq	(%rdi), %rax
00000000000f5e5b	callq	*0x18(%rax)
00000000000f5e5e	movq	$0x0, 0x260(%rbx)
00000000000f5e69	movq	0x268(%rbx), %rdi
00000000000f5e70	testq	%rdi, %rdi
00000000000f5e73	je	0xf5e86
00000000000f5e75	movq	(%rdi), %rax
00000000000f5e78	callq	*0x18(%rax)
00000000000f5e7b	movq	$0x0, 0x268(%rbx)
00000000000f5e86	movq	0x278(%rbx), %rdi
00000000000f5e8d	testq	%rdi, %rdi
00000000000f5e90	je	0xf5ea3
00000000000f5e92	movq	(%rdi), %rax
00000000000f5e95	callq	*0x18(%rax)
00000000000f5e98	movq	$0x0, 0x278(%rbx)
00000000000f5ea3	movq	0x270(%rbx), %rdi
00000000000f5eaa	testq	%rdi, %rdi
00000000000f5ead	je	0xf5ec0
00000000000f5eaf	movq	(%rdi), %rax
00000000000f5eb2	callq	*0x18(%rax)
00000000000f5eb5	movq	$0x0, 0x270(%rbx)
00000000000f5ec0	movq	0x2d0(%rbx), %rdi
00000000000f5ec7	testq	%rdi, %rdi
00000000000f5eca	je	0xf5edd
00000000000f5ecc	movq	(%rdi), %rax
00000000000f5ecf	callq	*0x18(%rax)
00000000000f5ed2	movq	$0x0, 0x2d0(%rbx)
00000000000f5edd	movq	0x2d8(%rbx), %rdi
00000000000f5ee4	testq	%rdi, %rdi
00000000000f5ee7	je	0xf5efa
00000000000f5ee9	movq	(%rdi), %rax
00000000000f5eec	callq	*0x18(%rax)
00000000000f5eef	movq	$0x0, 0x2d8(%rbx)
00000000000f5efa	movq	0x2e0(%rbx), %rdi
00000000000f5f01	testq	%rdi, %rdi
00000000000f5f04	je	0xf5f17
00000000000f5f06	movq	(%rdi), %rax
00000000000f5f09	callq	*0x18(%rax)
00000000000f5f0c	movq	$0x0, 0x2e0(%rbx)
00000000000f5f17	movq	0x198(%rbx), %rdi
00000000000f5f1e	testq	%rdi, %rdi
00000000000f5f21	je	0xf5f33
00000000000f5f23	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000000f5f28	movq	$0x0, 0x198(%rbx)
00000000000f5f33	addq	$0x8, %rsp
00000000000f5f37	popq	%rbx
00000000000f5f38	popq	%rbp
00000000000f5f39	retq
00000000000f5f3a	nopw	(%rax,%rax)
